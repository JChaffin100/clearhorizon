import WeatherIcon from './WeatherIcon.jsx';
import { getWeatherInfo } from '../utils/weatherCodes.js';
import { formatDay } from '../utils/timeUtils.js';
import { formatTempShort as fts } from '../utils/unitUtils.js';

export default function DailyForecast({ weather, selectedDayIndex, onDaySelect }) {
  if (!weather?.daily) return null;

  const { daily } = weather;
  const days = daily.time ?? [];

  // Min/max across all 16 days for the temperature range bar scaling
  const allMin = Math.min(...(daily.temperature_2m_min ?? []));
  const allMax = Math.max(...(daily.temperature_2m_max ?? []));
  const span   = allMax - allMin || 1;

  return (
    <section className="daily-forecast" aria-label="16-day forecast">
      {days.map((dateStr, i) => {
        const code    = daily.weather_code?.[i] ?? 0;
        const { iconKey, label } = getWeatherInfo(code, 1);
        const lo      = daily.temperature_2m_min?.[i];
        const hi      = daily.temperature_2m_max?.[i];
        const prob    = daily.precipitation_probability_max?.[i] ?? 0;
        const isSelected = i === selectedDayIndex;

        // Bar: position and width relative to allMin/allMax
        const barLeft  = lo != null ? ((lo - allMin) / span) * 100 : 0;
        const barWidth = (lo != null && hi != null) ? ((hi - lo) / span) * 100 : 0;

        return (
          <button
            key={dateStr}
            className={`daily-row${isSelected ? ' daily-row--selected' : ''}`}
            onClick={() => onDaySelect?.(i)}
            aria-label={`${formatDay(dateStr, i)}: ${label}, Low ${fts(lo)}, High ${fts(hi)}`}
            aria-pressed={isSelected}
          >
            <span className="daily-row__day">{formatDay(dateStr, i)}</span>
            <WeatherIcon iconKey={iconKey} size={22} />
            {prob > 10 && (
              <span className="daily-row__precip" aria-label={`${prob}% precipitation`}>
                {prob}%
              </span>
            )}
            <div className="daily-row__temps" aria-hidden="true">
              <span className="daily-row__lo">{fts(lo)}</span>
              <div className="daily-row__range-track">
                <div
                  className="daily-row__range-bar"
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                />
              </div>
              <span className="daily-row__hi">{fts(hi)}</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
