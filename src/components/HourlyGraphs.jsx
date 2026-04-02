import { useState } from 'react';
import { getHourlyForDay } from '../utils/timeUtils.js';
import { formatHour } from '../utils/timeUtils.js';

const GRAPH_H = 80;  // SVG viewBox height
const GRAPH_W = 700; // SVG viewBox width — scales to container via preserveAspectRatio

function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

function buildLinePath(values) {
  const norm  = normalize(values);
  const stepX = GRAPH_W / (norm.length - 1 || 1);
  return norm
    .map((n, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${GRAPH_H - n * (GRAPH_H - 8) - 4}`)
    .join(' ');
}

function buildAreaPath(values) {
  const norm  = normalize(values);
  const stepX = GRAPH_W / (norm.length - 1 || 1);
  const top   = norm.map((n, i) => `${i * stepX},${GRAPH_H - n * (GRAPH_H - 8) - 4}`).join(' ');
  return `M 0 ${GRAPH_H} L ${top} L ${GRAPH_W} ${GRAPH_H} Z`;
}

function PrecipGraph({ hourly }) {
  const probs   = hourly.precipitation_probability ?? Array(24).fill(0);
  const amounts = hourly.precipitation ?? Array(24).fill(0);
  const stepX   = GRAPH_W / 24;

  return (
    <svg
      viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      preserveAspectRatio="none"
      className="hourly-graph__svg"
      aria-hidden="true"
    >
      {/* Probability bars */}
      {probs.map((p, i) => (
        <rect
          key={i}
          x={i * stepX + 2}
          y={GRAPH_H - (p / 100) * (GRAPH_H - 4)}
          width={stepX - 4}
          height={(p / 100) * (GRAPH_H - 4)}
          fill="var(--graph-precip)"
          opacity="0.6"
        />
      ))}
      {/* Amount line overlay */}
      {amounts.some((a) => a > 0) && (
        <polyline
          points={amounts.map((a, i) => {
            const maxA = Math.max(...amounts, 0.01);
            return `${i * stepX + stepX / 2},${GRAPH_H - (a / maxA) * (GRAPH_H - 8) - 4}`;
          }).join(' ')}
          fill="none"
          stroke="var(--graph-precip-line)"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

function LineGraph({ values, gustValues, color, gradientId }) {
  if (!values || values.length < 2) return null;
  const linePath = buildLinePath(values);
  const areaPath = buildAreaPath(values);
  const gustPath = gustValues ? buildLinePath(gustValues) : null;

  return (
    <svg
      viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
      preserveAspectRatio="none"
      className="hourly-graph__svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      {/* Gust band */}
      {gustPath && (
        <path d={gustPath} fill="none" stroke={color} strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
      )}
      {/* Main line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ title, children, defaultExpanded = false }) {
  const [open, setOpen] = useState(defaultExpanded);
  return (
    <div className="hourly-graph__section">
      <button
        className="hourly-graph__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`hourly-graph__chevron${open ? ' hourly-graph__chevron--open' : ''}`} aria-hidden="true">›</span>
      </button>
      {open && <div className="hourly-graph__body">{children}</div>}
    </div>
  );
}

export default function HourlyGraphs({ weather, selectedDayIndex = 0 }) {
  if (!weather?.hourly) return null;

  const hourly = getHourlyForDay(weather, selectedDayIndex);

  // Desktop: expanded by default
  const isDesktop = window.innerWidth >= 768;

  return (
    <section className="hourly-graphs" aria-label="Hourly charts">
      <Section title="Precipitation" defaultExpanded={isDesktop}>
        <div className="hourly-graph__labels">
          <span className="hourly-graph__label-title">Chance of precipitation (%)</span>
        </div>
        <div className="hourly-graph__canvas">
          <PrecipGraph hourly={hourly} />
        </div>
        <HourAxisLabels times={hourly.time} />
      </Section>

      <Section title="Wind" defaultExpanded={isDesktop}>
        <div className="hourly-graph__labels">
          <span className="hourly-graph__label-title">Wind speed</span>
        </div>
        <div className="hourly-graph__canvas">
          <LineGraph
            values={hourly.wind_speed_10m}
            gustValues={hourly.wind_gusts_10m}
            color="var(--graph-wind)"
            gradientId="wind-grad"
          />
        </div>
        <HourAxisLabels times={hourly.time} />
      </Section>

      <Section title="Humidity" defaultExpanded={isDesktop}>
        <div className="hourly-graph__labels">
          <span className="hourly-graph__label-title">Relative humidity (%)</span>
        </div>
        <div className="hourly-graph__canvas">
          <LineGraph
            values={hourly.relative_humidity_2m}
            color="var(--graph-humidity)"
            gradientId="humidity-grad"
          />
        </div>
        <HourAxisLabels times={hourly.time} />
      </Section>
    </section>
  );
}

function HourAxisLabels({ times }) {
  if (!times) return null;
  // Show every 3 hours
  const labels = times.filter((_, i) => i % 3 === 0);
  return (
    <div className="hourly-graph__axis" aria-hidden="true">
      {labels.map((t) => (
        <span key={t} className="hourly-graph__axis-label">{formatHour(t)}</span>
      ))}
    </div>
  );
}
