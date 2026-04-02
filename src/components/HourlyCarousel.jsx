import { useEffect, useRef } from 'react';
import WeatherIcon from './WeatherIcon.jsx';
import { getWeatherInfo } from '../utils/weatherCodes.js';
import { formatHour, getHourlyForDay, getCurrentHourIndex } from '../utils/timeUtils.js';
import { formatTempShort } from '../utils/unitUtils.js';

export default function HourlyCarousel({ weather, selectedDayIndex = 0 }) {
  if (!weather?.hourly) return null;

  const hourly     = getHourlyForDay(weather, selectedDayIndex);
  const isToday    = selectedDayIndex === 0;
  const nowIndex   = isToday ? (getCurrentHourIndex(weather) % 24) : -1;
  const trackRef   = useRef(null);

  useEffect(() => {
    if (nowIndex >= 0 && trackRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        const activeCard = trackRef.current.querySelector('.hourly-card--now');
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }, 50);
    }
  }, [nowIndex, selectedDayIndex]);

  return (
    <section className="hourly-carousel" aria-label="Hourly forecast">
      <div className="hourly-carousel__track" role="list" ref={trackRef}>
        {hourly.time?.map((time, i) => {
          const code   = hourly.weather_code?.[i] ?? 0;
          const isDay  = 1; // hourly doesn't have is_day; approximate by hour
          const hour   = parseInt(time.slice(11, 13), 10);
          const dayHint = (hour >= 6 && hour < 20) ? 1 : 0;
          const { iconKey } = getWeatherInfo(code, dayHint);
          const temp   = hourly.temperature_2m?.[i];
          const prob   = hourly.precipitation_probability?.[i] ?? 0;
          const isNow  = i === nowIndex;

          return (
            <div
              key={time}
              className={`hourly-card${isNow ? ' hourly-card--now' : ''}`}
              role="listitem"
              aria-label={`${isNow ? 'Now' : formatHour(time)}: ${formatTempShort(temp)}, ${getWeatherInfo(code, dayHint).label}`}
            >
              <span className="hourly-card__time">{isNow ? 'Now' : formatHour(time)}</span>
              <WeatherIcon iconKey={iconKey} size={28} />
              <span className="hourly-card__temp">{formatTempShort(temp)}</span>
              {/* Precipitation probability bar */}
              <div className="hourly-card__precip-bar-wrap" aria-hidden="true">
                {prob > 20 ? (
                  <div
                    className="hourly-card__precip-bar"
                    style={{ height: `${prob}%` }}
                    title={`${prob}% chance of precip`}
                  />
                ) : (
                  <div className="hourly-card__precip-bar hourly-card__precip-bar--empty" />
                )}
              </div>
              {prob > 20 && (
                <span className="hourly-card__precip-pct">{prob}%</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
