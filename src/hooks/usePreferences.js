import { useState, useCallback } from 'react';

const PREFS_KEY = 'ch_prefs';
const MAX_CITIES = 10;

export const DEFAULT_PREFS = {
  version: '1.0',
  units: 'imperial',
  theme: 'system',
  radarDefaultZoom: 9,
  savedCities: [],
  activeLocationIndex: -1,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    if (e?.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded — preferences not saved');
    }
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(loadPrefs);

  const updatePrefs = useCallback((partial) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  }, []);

  /** Add a city. Returns false if the 10-city limit is reached. */
  const addCity = useCallback((city) => {
    let added = false;
    setPrefs((prev) => {
      if (prev.savedCities.length >= MAX_CITIES) return prev;
      // Prevent duplicate (same lat/lon)
      const dup = prev.savedCities.some(
        (c) =>
          c.latitude.toFixed(2) === city.latitude.toFixed(2) &&
          c.longitude.toFixed(2) === city.longitude.toFixed(2)
      );
      if (dup) { added = true; return prev; }
      const next = { ...prev, savedCities: [...prev.savedCities, city] };
      savePrefs(next);
      added = true;
      return next;
    });
    return added;
  }, []);

  /** Remove a city by index. Adjusts activeLocationIndex if needed. */
  const removeCity = useCallback((index) => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        savedCities: prev.savedCities.filter((_, i) => i !== index),
        activeLocationIndex:
          prev.activeLocationIndex === index
            ? -1
            : prev.activeLocationIndex > index
            ? prev.activeLocationIndex - 1
            : prev.activeLocationIndex,
      };
      savePrefs(next);
      return next;
    });
  }, []);

  /** Replace savedCities with a new ordered array (from drag-to-reorder). */
  const reorderCities = useCallback((newCities) => {
    setPrefs((prev) => {
      const next = { ...prev, savedCities: newCities };
      savePrefs(next);
      return next;
    });
  }, []);

  /** -1 = GPS, 0–9 = saved city index */
  const setActiveLocation = useCallback((index) => {
    updatePrefs({ activeLocationIndex: index });
  }, [updatePrefs]);

  return {
    prefs,
    updatePrefs,
    addCity,
    removeCity,
    reorderCities,
    setActiveLocation,
    MAX_CITIES,
  };
}
