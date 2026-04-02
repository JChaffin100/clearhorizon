import { compassDir, formatPressure, formatVisibility, formatDewPoint, uvLabel, uvColor, aqiLabel, aqiColor, formatTempShort } from '../utils/unitUtils.js';
import { formatTime } from '../utils/timeUtils.js';

function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`cond-card ${className}`}>
      <div className="cond-card__header">
        <span className="cond-card__icon" aria-hidden="true">{icon}</span>
        <span className="cond-card__title">{title}</span>
      </div>
      <div className="cond-card__body">{children}</div>
    </div>
  );
}

export default function ConditionCards({ weather, aqi, units }) {
  const c = weather?.current;
  const d = weather?.daily;
  const today = d ? 0 : null;

  if (!c) return null;

  const uv    = c.uv_index;
  const aqiVal = aqi?.current?.us_aqi;

  return (
    <section className="cond-cards" aria-label="Weather details">
      {/* ── Primary cards (always visible) ── */}

      {/* Wind */}
      <Card title="Wind" icon="💨">
        <div className="cond-card__value">
          {c.wind_speed_10m != null ? Math.round(c.wind_speed_10m) : '–'}
          <span className="cond-card__unit">{units === 'metric' ? ' km/h' : ' mph'}</span>
        </div>
        <div className="cond-card__sub">
          {compassDir(c.wind_direction_10m)}
          {c.wind_gusts_10m != null && ` · Gusts ${Math.round(c.wind_gusts_10m)} ${units === 'metric' ? 'km/h' : 'mph'}`}
        </div>
        {/* Wind direction arrow */}
        <div
          className="cond-card__wind-arrow"
          style={{ transform: `rotate(${c.wind_direction_10m ?? 0}deg)` }}
          aria-hidden="true"
        >↑</div>
      </Card>

      {/* Humidity */}
      <Card title="Humidity" icon="💧">
        <div className="cond-card__value">
          {c.relative_humidity_2m ?? '–'}
          <span className="cond-card__unit">%</span>
        </div>
        <div className="cond-card__sub">
          {weather?.hourly?.dew_point_2m &&
            `Dew point ${formatDewPoint(weather.hourly.dew_point_2m[0], units)}`}
        </div>
      </Card>

      {/* UV Index */}
      <Card title="UV Index" icon="☀️">
        <div className="cond-card__value" style={{ color: uvColor(uv) }}>
          {uv ?? '–'}
        </div>
        <div className="cond-card__sub" style={{ color: uvColor(uv) }}>
          {uvLabel(uv)}
        </div>
      </Card>

      {/* Pressure */}
      <Card title="Pressure" icon="🔵">
        <div className="cond-card__value" style={{ fontSize: '1.3rem' }}>
          {formatPressure(c.surface_pressure, units)}
        </div>
      </Card>

      {/* Sunrise & Sunset */}
      <Card title="Sun" icon="🌅">
        <div className="cond-card__sun-row">
          <span>🌄 {d?.sunrise?.[0] ? formatTime(d.sunrise[0]) : '–'}</span>
          <span>🌇 {d?.sunset?.[0]  ? formatTime(d.sunset[0])  : '–'}</span>
        </div>
      </Card>

      {/* ── Divider ── */}
      <div className="cond-cards__divider" role="separator" />

      {/* ── Extended cards ── */}

      {/* Precipitation */}
      <Card title="Precipitation" icon="🌧">
        <div className="cond-card__value" style={{ fontSize: '1.3rem' }}>
          {d?.precipitation_sum?.[0] != null
            ? `${d.precipitation_sum[0]} ${units === 'metric' ? 'mm' : 'in'}`
            : '–'}
        </div>
        <div className="cond-card__sub">Expected today</div>
      </Card>

      {/* Visibility */}
      <Card title="Visibility" icon="👁">
        <div className="cond-card__value" style={{ fontSize: '1.3rem' }}>
          {formatVisibility(c.visibility, units)}
        </div>
      </Card>

      {/* Dew Point */}
      <Card title="Dew Point" icon="🌡">
        <div className="cond-card__value">
          {weather?.hourly?.dew_point_2m
            ? formatDewPoint(weather.hourly.dew_point_2m[0], units)
            : '–'}
        </div>
      </Card>



      {/* Air Quality */}
      <Card title="Air Quality" icon="🌿">
        {aqiVal != null ? (
          <>
            <div
              className="cond-card__value"
              style={{ color: aqiColor(aqiVal) }}
              aria-label={`AQI ${aqiVal}: ${aqiLabel(aqiVal)}`}
            >
              {aqiVal}
            </div>
            <div
              className="cond-card__sub"
              style={{ color: aqiColor(aqiVal) }}
            >
              {aqiLabel(aqiVal)}
            </div>
          </>
        ) : (
          <div className="cond-card__value">–</div>
        )}
      </Card>
    </section>
  );
}
