import { useState } from 'react';
import { isSevereCode, getWeatherInfo } from '../utils/weatherCodes.js';

export default function SevereWeatherBanner({ weatherCode, isDay = 1 }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isSevereCode(weatherCode)) return null;

  const { label } = getWeatherInfo(weatherCode, isDay);

  return (
    <div className="severe-banner" role="alert">
      <span className="severe-banner__icon" aria-hidden="true">⚠️</span>
      <span className="severe-banner__text">
        <strong>Severe weather:</strong> {label}
      </span>
      <button
        className="severe-banner__dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss severe weather alert"
      >
        ✕
      </button>
    </div>
  );
}
