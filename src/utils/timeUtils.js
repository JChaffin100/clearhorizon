// Time utilities for Open-Meteo datetime strings.
//
// Open-Meteo with timezone=auto returns strings in the *location's* local time,
// e.g. "2024-04-02T15:00" (no UTC offset). We parse components directly from
// the string so the browser's own timezone never gets applied.

/** Extract hour (0–23) from an ISO datetime string like "2024-04-02T15:00" */
export function hourFromISO(iso) {
  if (!iso) return 0;
  const t = iso.indexOf('T');
  return t >= 0 ? parseInt(iso.slice(t + 1, t + 3), 10) : 0;
}

/** Format "2024-04-02T15:00" → "3 PM" */
export function formatHour(iso) {
  const h = hourFromISO(iso);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12} ${period}`;
}

/** Format "2024-04-02T06:32" → "6:32 AM" */
export function formatTime(iso) {
  if (!iso) return '';
  const t = iso.indexOf('T');
  if (t < 0) return iso;
  const [hStr, mStr] = iso.slice(t + 1).split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

/**
 * Format a daily date string for DailyForecast row labels.
 * index 0 → "Today", 1 → "Tomorrow", 2+ → "Thu Apr 3"
 */
export function formatDay(iso, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  if (!iso) return '';
  const [y, mo, d] = iso.split('T')[0].split('-').map(Number);
  // Use UTC to avoid DST boundary issues with date-only strings
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format a JS Date for the "Updated X:XX PM" stamp */
export function formatUpdated(date) {
  if (!date) return '';
  return `Updated ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
}

/**
 * Find the index in weather.hourly.time that matches weather.current.time.
 * Returns 0 if not found. Avoids any timezone math.
 */
export function getCurrentHourIndex(weather) {
  if (!weather?.current?.time || !weather?.hourly?.time) return 0;
  // Truncate current time to top of the hour: "2024-04-02T15:45" -> "2024-04-02T15:00"
  const currentHourStr = weather.current.time.slice(0, 13) + ":00";
  const idx = weather.hourly.time.indexOf(currentHourStr);
  return idx >= 0 ? idx : 0;
}

/** Return the hourly data slice for a given day index (0 = today). */
export function getHourlyForDay(weather, dayIndex) {
  if (!weather?.hourly) return [];
  const start = dayIndex * 24;
  const end = start + 24;
  const keys = Object.keys(weather.hourly).filter((k) => k !== 'time');
  const slice = { time: weather.hourly.time.slice(start, end) };
  keys.forEach((k) => {
    slice[k] = weather.hourly[k].slice(start, end);
  });
  return slice;
}
