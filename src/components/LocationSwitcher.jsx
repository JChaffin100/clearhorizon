import { useEffect, useRef } from 'react';

export default function LocationSwitcher({
  open,
  onClose,
  savedCities,
  activeLocationIndex,
  hasGPS,
  onSelectGPS,
  onSelectCity,
  onAddCity,
}) {
  const sheetRef = useRef(null);

  // Trap focus and dismiss with Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    sheetRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="location-sheet"
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Switch location"
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-header">
          <h2 className="sheet-title">Locations</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close location switcher">✕</button>
        </div>

        <div className="location-sheet__list">
          {/* GPS option */}
          {hasGPS && (
            <button
              className={`location-item${activeLocationIndex === -1 ? ' location-item--active' : ''}`}
              onClick={() => { onSelectGPS?.(); onClose?.(); }}
              aria-pressed={activeLocationIndex === -1}
            >
              <span className="location-item__icon" aria-hidden="true">📍</span>
              <span className="location-item__name">My Location</span>
              {activeLocationIndex === -1 && (
                <span className="location-item__check" aria-hidden="true">✓</span>
              )}
            </button>
          )}

          {/* Saved cities */}
          {savedCities.map((city, i) => (
            <button
              key={`${city.latitude},${city.longitude}`}
              className={`location-item${activeLocationIndex === i ? ' location-item--active' : ''}`}
              onClick={() => { onSelectCity?.(i); onClose?.(); }}
              aria-pressed={activeLocationIndex === i}
            >
              <span className="location-item__icon" aria-hidden="true">🏙</span>
              <div className="location-item__info">
                <span className="location-item__name">{city.name}</span>
                <span className="location-item__sub">
                  {[city.admin1, city.country].filter(Boolean).join(', ')}
                </span>
              </div>
              {activeLocationIndex === i && (
                <span className="location-item__check" aria-hidden="true">✓</span>
              )}
            </button>
          ))}

          {/* Add city */}
          <button className="location-item location-item--add" onClick={onAddCity}>
            <span className="location-item__icon" aria-hidden="true">＋</span>
            <span className="location-item__name">Add City</span>
          </button>
        </div>
      </div>
    </>
  );
}
