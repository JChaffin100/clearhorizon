import { useState, useEffect, useRef, useCallback } from 'react';
import Sortable from 'sortablejs';
import { DEFAULT_PREFS } from '../hooks/usePreferences.js';

// --- Version helper (reads from service worker via postMessage) ---
async function getSWVersion() {
  if (!navigator.serviceWorker?.controller) return null;
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data?.version ?? null);
    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_VERSION' },
      [channel.port2]
    );
    setTimeout(() => resolve(null), 2000);
  });
}

// --- CSV export ---
function exportPrefs(prefs) {
  const cities = prefs.savedCities
    .map((c) => `${[c.name, c.admin1, c.country].filter(Boolean).join(' ')}|${c.latitude}|${c.longitude}|${c.timezone}`)
    .join(',');

  const rows = [
    'setting,value',
    `version,${prefs.version}`,
    `units,${prefs.units}`,
    `theme,${prefs.theme}`,
    `radarDefaultZoom,${prefs.radarDefaultZoom}`,
    `savedCities,"${cities}"`,
  ].join('\n');

  const blob = new Blob([rows], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: 'clearhorizon-preferences.csv',
  });
  a.click();
  URL.revokeObjectURL(url);
}

// --- CSV import ---
function parsePrefsCSV(text) {
  const lines = text.trim().split('\n');
  if (lines[0].trim() !== 'setting,value') throw new Error('Invalid file format');
  const map = {};
  for (let i = 1; i < lines.length; i++) {
    const comma = lines[i].indexOf(',');
    if (comma < 0) continue;
    const key = lines[i].slice(0, comma).trim();
    let val   = lines[i].slice(comma + 1).trim().replace(/^"|"$/g, '');
    map[key] = val;
  }

  const parsed = { ...DEFAULT_PREFS };
  if (map.version)         parsed.version         = map.version;
  if (map.units)           parsed.units           = map.units;
  if (map.theme)           parsed.theme           = map.theme;
  if (map.radarDefaultZoom) parsed.radarDefaultZoom = parseInt(map.radarDefaultZoom, 10);
  if (map.savedCities) {
    parsed.savedCities = map.savedCities
      .split(',')
      .filter(Boolean)
      .map((entry) => {
        const [displayName, lat, lon, tz] = entry.split('|');
        const parts = (displayName ?? '').split(' ');
        return {
          name:      parts[0] ?? displayName,
          admin1:    parts[1] ?? '',
          country:   parts[2] ?? '',
          latitude:  parseFloat(lat),
          longitude: parseFloat(lon),
          timezone:  tz ?? '',
        };
      });
  }
  return parsed;
}

const ZOOM_LABELS = {
  4: 'Continent', 5: 'Country', 6: 'State', 7: 'Regional', 8: 'County', 9: '50-mile radius',
  10: 'City', 11: 'District', 12: 'Neighborhood', 13: 'Street',
};

export default function SettingsPanel({
  open, onClose,
  prefs, updatePrefs, addCity, removeCity, reorderCities,
  onAddCity, onRefreshWeather, MAX_CITIES,
}) {
  const [version,   setVersion]   = useState(null);
  const [toast,     setToast]     = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const sortableRef = useRef(null);
  const sortableInst = useRef(null);
  const panelRef    = useRef(null);

  // Load SW version when panel opens
  useEffect(() => {
    if (!open) return;
    getSWVersion().then(setVersion);
  }, [open]);

  // Trap focus / Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [open, onClose]);

  // SortableJS for city list
  useEffect(() => {
    if (!open || !sortableRef.current) return;
    sortableInst.current = Sortable.create(sortableRef.current, {
      animation: 150,
      handle: '.city-row__drag',
      onEnd: (evt) => {
        const cities = [...prefs.savedCities];
        const [moved] = cities.splice(evt.oldIndex, 1);
        cities.splice(evt.newIndex, 0, moved);
        reorderCities(cities);
      },
    });
    return () => sortableInst.current?.destroy();
  }, [open, prefs.savedCities]); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parsePrefsCSV(ev.target.result);
        updatePrefs(parsed);
        showToast('Preferences imported successfully');
      } catch {
        showToast('Error: invalid preferences file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [updatePrefs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefreshWeather?.();
    setTimeout(() => setRefreshing(false), 1000);
  }, [onRefreshWeather]);

  const handleCheckUpdate = useCallback(async () => {
    showToast('Checking for updates…');

    try {
      // 1. Manually wipe out all PWA CacheStorage to guarantee fresh assets
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Force service worker to fetch the newly available script
      if (navigator.serviceWorker) {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          await reg.update();
        }
      }

      showToast('Update pulled successfully — reloading…');
      
      // 3. Reload cleanly so everything comes from the network
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Update check failed:', err);
      showToast('Error pulling update. Please try again.');
    }
  }, []);

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="settings-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="sheet-header">
          <h2 className="sheet-title">Settings</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <div className="settings-panel__body">

          {/* ── LOCATIONS ── */}
          <section className="settings-section">
            <h3 className="settings-section__title">Locations</h3>

            {/* City list with drag-to-reorder */}
            <ul ref={sortableRef} className="city-list" aria-label="Saved cities">
              {prefs.savedCities.map((city, i) => (
                <li key={`${city.latitude},${city.longitude}`} className="city-row">
                  <span className="city-row__drag" aria-hidden="true" title="Drag to reorder">⠿</span>
                  <div className="city-row__info">
                    <span className="city-row__name">{city.name}</span>
                    <span className="city-row__sub">
                      {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <button
                    className="city-row__delete"
                    onClick={() => removeCity(i)}
                    aria-label={`Remove ${city.name}`}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            {prefs.savedCities.length >= MAX_CITIES ? (
              <p className="settings-limit-msg">
                10-city limit reached. Remove a city to add a new one.
              </p>
            ) : (
              <button className="settings-btn settings-btn--ghost" onClick={onAddCity}>
                ＋ Add City
              </button>
            )}
          </section>

          {/* ── DISPLAY ── */}
          <section className="settings-section">
            <h3 className="settings-section__title">Display</h3>

            <div className="settings-row">
              <span className="settings-row__label">Theme</span>
              <div className="segmented-control" role="group" aria-label="Theme">
                {['system', 'light', 'dark'].map((t) => (
                  <button
                    key={t}
                    className={`segmented-control__btn${prefs.theme === t ? ' segmented-control__btn--active' : ''}`}
                    onClick={() => updatePrefs({ theme: t })}
                    aria-pressed={prefs.theme === t}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row">
              <span className="settings-row__label">Units</span>
              <div className="segmented-control" role="group" aria-label="Units">
                {['imperial', 'metric'].map((u) => (
                  <button
                    key={u}
                    className={`segmented-control__btn${prefs.units === u ? ' segmented-control__btn--active' : ''}`}
                    onClick={() => updatePrefs({ units: u })}
                    aria-pressed={prefs.units === u}
                  >
                    {u === 'imperial' ? 'Imperial' : 'Metric'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── RADAR ── */}
          <section className="settings-section">
            <h3 className="settings-section__title">Radar</h3>
            <div className="settings-row settings-row--col">
              <div className="settings-row__label">
                Default zoom — {ZOOM_LABELS[prefs.radarDefaultZoom] ?? prefs.radarDefaultZoom}
              </div>
              <input
                type="range"
                min="4"
                max="13"
                value={prefs.radarDefaultZoom}
                onChange={(e) => updatePrefs({ radarDefaultZoom: parseInt(e.target.value, 10) })}
                className="settings-slider"
                aria-label="Radar default zoom"
                aria-valuetext={ZOOM_LABELS[prefs.radarDefaultZoom]}
              />
              <div className="settings-slider__labels">
                <span>Continent</span>
                <span>Street</span>
              </div>
            </div>
          </section>

          {/* ── DATA ── */}
          <section className="settings-section">
            <h3 className="settings-section__title">Data</h3>

            <button
              className="settings-btn settings-btn--primary"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-busy={refreshing}
            >
              {refreshing ? 'Refreshing…' : 'Refresh Weather'}
            </button>

            <button
              className="settings-btn settings-btn--ghost"
              onClick={() => exportPrefs(prefs)}
            >
              Export Preferences
            </button>

            <label className="settings-btn settings-btn--ghost" style={{ cursor: 'pointer' }}>
              Import Preferences
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleImport}
                aria-label="Import preferences CSV"
              />
            </label>
          </section>

          {/* ── ABOUT ── */}
          <section className="settings-section">
            <h3 className="settings-section__title">About</h3>
            <p className="settings-about__name">ClearHorizon</p>
            <p className="settings-about__version">Version: {version ?? 'loading…'}</p>
            <p className="settings-about__credits">
              Weather by <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
              {' · '}Radar by <a href="https://www.rainviewer.com" target="_blank" rel="noopener noreferrer">RainViewer</a>
              {' · '}Maps by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> / <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>
            </p>

            <button className="settings-btn settings-btn--ghost" onClick={handleCheckUpdate}>
              Check for Updates
            </button>
          </section>
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="settings-toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
