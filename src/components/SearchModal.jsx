import { useState, useRef, useEffect, useCallback } from 'react';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export default function SearchModal({ open, onClose, onSelect, atLimit }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef  = useRef(null);
  const debounce  = useRef(null);

  // Focus input on open; close on Escape
  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setError(''); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const url = `${GEO_URL}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) setError('No locations found.');
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(q), 350);
  };

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search for a city"
      >
        <div className="sheet-header">
          <h2 className="sheet-title">Add City</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close search">✕</button>
        </div>

        <div className="search-modal__input-wrap">
          <span className="search-modal__icon" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            type="search"
            className="search-modal__input"
            placeholder="Search city, town or ZIP…"
            value={query}
            onChange={onInput}
            aria-label="City search"
            autoComplete="off"
          />
          {loading && <span className="search-modal__spinner" aria-label="Searching…" />}
        </div>

        {atLimit && (
          <p className="search-modal__limit-msg">
            You've reached the 10-city limit. Remove a city in Settings to add a new one.
          </p>
        )}

        {error && <p className="search-modal__error" role="alert">{error}</p>}

        <ul className="search-modal__results" role="listbox" aria-label="Search results">
          {results.map((r) => {
            const label = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
            return (
              <li key={`${r.latitude},${r.longitude}`} role="option">
                <button
                  className="search-result"
                  disabled={atLimit}
                  onClick={() => {
                    onSelect?.({
                      name:      r.name,
                      country:   r.country,
                      admin1:    r.admin1,
                      latitude:  r.latitude,
                      longitude: r.longitude,
                      timezone:  r.timezone,
                    });
                    onClose?.();
                  }}
                  aria-label={`Add ${label}`}
                >
                  <span className="search-result__name">{r.name}</span>
                  <span className="search-result__sub">
                    {[r.admin1, r.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
