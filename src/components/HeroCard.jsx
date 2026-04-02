import { useRef, useState, useCallback } from 'react';
import { getSkyStyle } from '../utils/skyStyles.js';
import { getWeatherInfo } from '../utils/weatherCodes.js';
import { formatTemp, formatTempShort } from '../utils/unitUtils.js';
import { formatUpdated } from '../utils/timeUtils.js';

const PULL_THRESHOLD = 80; // px

export default function HeroCard({
  weather,
  units,
  locationName,
  loading,
  isOffline,
  lastUpdated,
  onRefresh,
  onLocationClick,
  onSettingsClick,
}) {
  const current   = weather?.current;
  const daily     = weather?.daily;
  const isDay     = current?.is_day ?? 1;
  const code      = current?.weather_code ?? 0;
  const { label, skyKey } = getWeatherInfo(code, isDay);
  const skyStyle  = getSkyStyle(skyKey);

  // Pull-to-refresh state
  const [pullDist, setPullDist]       = useState(0);
  const [isPulling, setIsPulling]     = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!isPulling) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setPullDist(Math.min(delta, PULL_THRESHOLD * 1.5));
      if (delta > 10) e.preventDefault();
    }
  }, [isPulling]);

  const onTouchEnd = useCallback(() => {
    if (pullDist >= PULL_THRESHOLD) {
      onRefresh?.();
    }
    setPullDist(0);
    setIsPulling(false);
  }, [pullDist, onRefresh]);

  const temp   = current?.temperature_2m;
  const feels  = current?.apparent_temperature;
  const todayMax = daily?.temperature_2m_max?.[0];
  const todayMin = daily?.temperature_2m_min?.[0];

  const pullIndicatorOpacity = Math.min(pullDist / PULL_THRESHOLD, 1);
  const pullIndicatorScale   = 0.5 + pullIndicatorOpacity * 0.5;

  return (
    <div
      className="hero-card"
      style={{
        ...skyStyle,
        transform: pullDist > 0 ? `translateY(${Math.min(pullDist * 0.4, 32)}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
    >
      {/* Dark scrim for text readability */}
      <div className="hero-card__scrim" />

      {/* Pull-to-refresh indicator */}
      {pullDist > 0 && (
        <div
          className="hero-card__pull-indicator"
          style={{ opacity: pullIndicatorOpacity, transform: `scale(${pullIndicatorScale})` }}
          aria-hidden="true"
        >
          {pullDist >= PULL_THRESHOLD ? '↻' : '↓'}
        </div>
      )}

      {/* Top row: location + settings */}
      <div className="hero-card__topbar">
        <button
          className="hero-card__location-btn"
          onClick={onLocationClick}
          aria-label={`Location: ${locationName}. Tap to change.`}
        >
          <span className="hero-card__location-icon" aria-hidden="true">📍</span>
          <span className="hero-card__location-name">{locationName || '–'}</span>
        </button>
        <button
          className="hero-card__settings-btn"
          onClick={onSettingsClick}
          aria-label="Open settings"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Centre: temperature + condition */}
      <div className="hero-card__center">
        {loading && !temp ? (
          <div className="hero-card__loading-ring" aria-label="Loading weather data" />
        ) : (
          <>
            <div
              className="hero-card__temp"
              aria-label={`${Math.round(temp ?? 0)} degrees ${units === 'metric' ? 'Celsius' : 'Fahrenheit'}`}
            >
              {temp != null ? `${Math.round(temp)}°` : '–°'}
            </div>
            <div className="hero-card__condition">{label}</div>
            {feels != null && (
              <div className="hero-card__feels">
                Feels like {formatTempShort(feels)}
              </div>
            )}
            {todayMax != null && todayMin != null && (
              <div className="hero-card__hilow">
                H: {formatTempShort(todayMax)} · L: {formatTempShort(todayMin)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom row: offline banner + updated time */}
      <div className="hero-card__bottombar">
        {isOffline && (
          <span className="hero-card__offline-badge">Offline – showing cached data</span>
        )}
        {lastUpdated && (
          <span className="hero-card__updated">{formatUpdated(lastUpdated)}</span>
        )}
      </div>
    </div>
  );
}
