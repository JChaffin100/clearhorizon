// Unit conversion and formatting helpers.
// Open-Meteo is called with imperial or metric units based on user preference,
// so most values come back already in the right unit. These helpers handle
// display formatting and any secondary conversions needed.

/** Round to 1 decimal, stripping trailing .0 */
function r1(n) {
  const v = Math.round(n * 10) / 10;
  return Number.isInteger(v) ? v.toString() : v.toString();
}

// --- Temperature ---

export function formatTemp(val, units) {
  if (val == null) return '–';
  const deg = Math.round(val);
  return `${deg}°${units === 'metric' ? 'C' : 'F'}`;
}

export function formatTempShort(val) {
  if (val == null) return '–';
  return `${Math.round(val)}°`;
}

// --- Wind ---

export function formatWind(speed, dir, units) {
  if (speed == null) return '–';
  const unit = units === 'metric' ? 'km/h' : 'mph';
  return `${Math.round(speed)} ${unit} ${compassDir(dir)}`;
}

export function formatWindShort(speed, units) {
  if (speed == null) return '–';
  const unit = units === 'metric' ? 'km/h' : 'mph';
  return `${Math.round(speed)} ${unit}`;
}

/** Convert wind degrees to 8-point compass direction */
export function compassDir(deg) {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// --- Pressure ---

export function formatPressure(hpa, units) {
  if (hpa == null) return '–';
  if (units === 'metric') return `${Math.round(hpa)} hPa`;
  // Convert hPa → inHg
  const inHg = hpa * 0.02953;
  return `${r1(inHg)} inHg`;
}

// --- Visibility ---

export function formatVisibility(meters, units) {
  if (meters == null) return '–';
  if (units === 'metric') {
    const km = meters / 1000;
    return `${r1(km)} km`;
  }
  const miles = meters / 1609.344;
  return `${r1(miles)} mi`;
}

// --- Precipitation ---

export function formatPrecip(val, units) {
  if (val == null) return '–';
  const unit = units === 'metric' ? 'mm' : 'in';
  return `${r1(val)} ${unit}`;
}

// --- UV Index ---

export function uvLabel(uv) {
  if (uv == null) return 'Unknown';
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function uvColor(uv) {
  if (uv == null) return '#6b7280';
  if (uv <= 2) return '#22c55e';
  if (uv <= 5) return '#eab308';
  if (uv <= 7) return '#f97316';
  if (uv <= 10) return '#ef4444';
  return '#a855f7';
}

// --- AQI ---

export function aqiLabel(aqi) {
  if (aqi == null) return 'Unknown';
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function aqiColor(aqi) {
  if (aqi == null) return '#6b7280';
  if (aqi <= 50)  return '#2d7d46';
  if (aqi <= 100) return '#b45309';
  if (aqi <= 150) return '#c2410c';
  if (aqi <= 200) return '#b91c1c';
  if (aqi <= 300) return '#7e22ce';
  return '#881337';
}

// --- Moon Phase ---

export function moonPhaseInfo(phase) {
  if (phase == null) return { name: '–', emoji: '🌑' };
  if (phase === 0 || phase === 1)          return { name: 'New Moon',        emoji: '🌑' };
  if (phase < 0.25)                        return { name: 'Waxing Crescent', emoji: '🌒' };
  if (phase === 0.25)                      return { name: 'First Quarter',   emoji: '🌓' };
  if (phase < 0.5)                         return { name: 'Waxing Gibbous',  emoji: '🌔' };
  if (phase === 0.5)                       return { name: 'Full Moon',       emoji: '🌕' };
  if (phase < 0.75)                        return { name: 'Waning Gibbous',  emoji: '🌖' };
  if (phase === 0.75)                      return { name: 'Last Quarter',    emoji: '🌗' };
  return { name: 'Waning Crescent', emoji: '🌘' };
}

// --- Dew Point ---

export function formatDewPoint(val, units) {
  if (val == null) return '–';
  return `${Math.round(val)}°${units === 'metric' ? 'C' : 'F'}`;
}
