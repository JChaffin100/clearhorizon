// Inline SVG weather icons keyed by iconKey from weatherCodes.js
// Each icon is a clean 24×24 SVG suitable for any size via width/height props.

const icons = {
  'clear-day': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="#FCD34D" />
      <line x1="12" y1="2"  x2="12" y2="5"  stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="2"  y1="12" x2="5"  y2="12" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="22" y2="12" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"  stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'clear-night': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="#C7D2FE" />
    </svg>
  ),
  'partly-cloudy-day': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="3.5" fill="#FCD34D" />
      <line x1="9" y1="2"   x2="9" y2="4"   stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="14"  x2="9" y2="16"  stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="9"   x2="4" y2="9"   stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="9"  x2="16" y2="9"  stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.93" y1="3.93" x2="5.34" y2="5.34" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.66" y1="12.66" x2="14.07" y2="14.07" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 17H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="white" opacity="0.95"/>
    </svg>
  ),
  'partly-cloudy-night': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11.5A5.5 5.5 0 1 1 8.5 6a4 4 0 0 0 8.5 5.5z" fill="#C7D2FE"/>
      <path d="M20 17H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="white" opacity="0.9"/>
    </svg>
  ),
  'cloudy': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 17H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#CBD5E1"/>
    </svg>
  ),
  'fog': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 17H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#CBD5E1"/>
      <line x1="3" y1="20" x2="21" y2="20" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
      <line x1="5" y1="22" x2="19" y2="22" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'drizzle': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#94A3B8"/>
      <line x1="8"  y1="18" x2="7"  y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="11" y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="18" x2="15" y2="21" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'rain': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#64748B"/>
      <line x1="8"  y1="17" x2="6"  y2="22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="10" y2="22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="14" y2="22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'thunderstorm': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#475569"/>
      <polyline points="13,17 10,22 13,22 10,27" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'snow': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#94A3B8"/>
      <circle cx="8"  cy="20" r="1.5" fill="white"/>
      <circle cx="12" cy="22" r="1.5" fill="white"/>
      <circle cx="16" cy="20" r="1.5" fill="white"/>
    </svg>
  ),
  'sleet': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#64748B"/>
      <line x1="8"  y1="17" x2="7"  y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7"  cy="21.5" r="1.5" fill="white"/>
      <line x1="14" y1="17" x2="13" y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="13" cy="21.5" r="1.5" fill="white"/>
    </svg>
  ),
  'blizzard': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H7a4 4 0 0 1 0-8 5 5 0 0 1 9.8 1H20a2 2 0 0 1 0 7z" fill="#64748B"/>
      <circle cx="7"  cy="19.5" r="1.5" fill="white"/>
      <circle cx="11" cy="21.5" r="1.5" fill="white"/>
      <circle cx="15" cy="19.5" r="1.5" fill="white"/>
      <circle cx="19" cy="21.5" r="1.5" fill="white"/>
    </svg>
  ),
  // Fallback
  'clear': (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" fill="#FCD34D" />
    </svg>
  ),
};

export default function WeatherIcon({ iconKey = 'clear-day', size = 32, className = '' }) {
  const icon = icons[iconKey] ?? icons['clear-day'];
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0 }}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
