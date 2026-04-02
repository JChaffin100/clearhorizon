import { useState, useEffect, useCallback, useRef } from 'react';

const WEATHER_TTL = 30 * 60 * 1000; // 30 minutes (cache freshness)
const AQI_TTL     = 60 * 60 * 1000; // 1 hour

function cacheKey(prefix, lat, lon) {
  return `${prefix}_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    if (e?.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded — weather cache not saved');
    }
  }
}

function isFresh(cached, ttl) {
  return cached && Date.now() - cached.timestamp < ttl;
}

async function fetchWeatherData(lat, lon, units) {
  const tempUnit  = units === 'metric' ? 'celsius'    : 'fahrenheit';
  const windUnit  = units === 'metric' ? 'kmh'        : 'mph';
  const precipUnit = units === 'metric' ? 'mm'        : 'inch';

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',  lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current', [
    'temperature_2m','relative_humidity_2m','apparent_temperature',
    'precipitation','weather_code','wind_speed_10m','wind_direction_10m',
    'wind_gusts_10m','surface_pressure','visibility','uv_index','is_day',
  ].join(','));
  url.searchParams.set('hourly', [
    'temperature_2m','relative_humidity_2m','apparent_temperature',
    'precipitation_probability','precipitation','weather_code',
    'wind_speed_10m','wind_direction_10m','wind_gusts_10m',
    'uv_index','dew_point_2m','visibility','surface_pressure',
  ].join(','));
  url.searchParams.set('daily', [
    'weather_code','temperature_2m_max','temperature_2m_min',
    'apparent_temperature_max','apparent_temperature_min',
    'sunrise','sunset','precipitation_sum','precipitation_probability_max',
    'wind_speed_10m_max','wind_gusts_10m_max','uv_index_max',
    'precipitation_hours'
  ].join(','));
  url.searchParams.set('forecast_days',      '16');
  url.searchParams.set('timezone',           'auto');
  url.searchParams.set('wind_speed_unit',    windUnit);
  url.searchParams.set('precipitation_unit', precipUnit);
  url.searchParams.set('temperature_unit',   tempUnit);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  return res.json();
}

async function fetchAQIData(lat, lon) {
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.searchParams.set('latitude',  lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current',   'us_aqi,pm2_5,pm10');
  url.searchParams.set('timezone',  'auto');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`AQI fetch failed: ${res.status}`);
  return res.json();
}

export function useWeather(coords, units = 'imperial') {
  const [weather, setWeather]       = useState(null);
  const [aqi, setAqi]               = useState(null);
  const [loading, setLoading]       = useState(false);
  const [isOffline, setIsOffline]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const lastFetchRef = useRef(null);
  const coordsRef    = useRef(coords);
  const unitsRef     = useRef(units);

  // Keep refs current so the visibility handler always uses latest values
  useEffect(() => { coordsRef.current = coords; }, [coords]);
  useEffect(() => { unitsRef.current = units;   }, [units]);

  /**
   * fetch — always hits the network (for fresh data).
   * Shows cached data immediately while the network request is in flight.
   */
  const fetch_ = useCallback(async (lat, lon, u, { showLoadingSpinner = false } = {}) => {
    const wKey = cacheKey('ch_weather', lat, lon);
    const aKey = cacheKey('ch_aqi',     lat, lon);

    // 1. Immediately surface any cached data so the UI is never blank
    const cachedW = readCache(wKey);
    const cachedA = readCache(aKey);
    if (cachedW) {
      setWeather(cachedW.data);
      setLastUpdated(new Date(cachedW.timestamp));
      setIsOffline(false);
    }
    if (cachedA) setAqi(cachedA.data);

    if (showLoadingSpinner) setLoading(true);

    try {
      const [freshW, freshA] = await Promise.allSettled([
        fetchWeatherData(lat, lon, u),
        fetchAQIData(lat, lon),
      ]);

      if (freshW.status === 'fulfilled') {
        writeCache(wKey, freshW.value);
        setWeather(freshW.value);
        setLastUpdated(new Date());
        setIsOffline(false);
      } else if (!cachedW) {
        // No cache and network failed — show offline state
        setIsOffline(true);
      }

      if (freshA.status === 'fulfilled') {
        writeCache(aKey, freshA.value);
        setAqi(freshA.value);
      }
    } catch {
      if (!cachedW) setIsOffline(true);
    } finally {
      setLoading(false);
      lastFetchRef.current = Date.now();
    }
  }, []);

  // --- Auto-refresh on every mount / coords / units change ---
  // Always fetch fresh from the network; cached data is shown immediately
  // while the request completes.
  useEffect(() => {
    if (!coords?.latitude || !coords?.longitude) return;
    fetch_(coords.latitude, coords.longitude, units, { showLoadingSpinner: !weather });
  }, [coords?.latitude, coords?.longitude, units]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Auto-refresh when the tab / PWA becomes visible again ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const c = coordsRef.current;
      if (!c?.latitude || !c?.longitude) return;
      // Refresh if it's been more than 5 minutes since last fetch
      const elapsed = lastFetchRef.current ? Date.now() - lastFetchRef.current : Infinity;
      if (elapsed > 5 * 60 * 1000) {
        fetch_(c.latitude, c.longitude, unitsRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetch_]);

  /** Manual refresh — always fetches fresh, shows spinner */
  const refresh = useCallback(() => {
    const c = coordsRef.current;
    if (!c?.latitude || !c?.longitude) return;
    fetch_(c.latitude, c.longitude, unitsRef.current, { showLoadingSpinner: true });
  }, [fetch_]);

  return { weather, aqi, loading, isOffline, lastUpdated, refresh };
}
