/**
 * components/CurrentWeatherCard.jsx
 * Displays the main weather hero card: city, temperature, condition,
 * feels like, humidity, wind speed, pressure, and last updated time.
 * Shows CurrentWeatherSkeleton while loading.
 */

import { useTemperature } from '@context/TemperatureContext';
import WeatherIcon from './WeatherIcon';
import { CurrentWeatherSkeleton } from './LoadingSpinner';
import {
  capitalize,
  getFlagEmoji,
  getWindDirection,
  formatTime,
  timeAgo,
} from '@utils/weatherUtils';

/**
 * @param {{ data: object|null, loading: boolean }} props
 */
export default function CurrentWeatherCard({ data, loading }) {
  const { convertTemp, unitSymbol } = useTemperature();

  if (loading) return <CurrentWeatherSkeleton />;
  if (!data)   return null;

  const {
    name,
    sys:     { country, sunrise, sunset } = {},
    weather: [{ description, icon, main } = {}] = [],
    main:    { temp, feels_like, humidity, pressure } = {},
    wind:    { speed, deg } = {},
    dt,
    visibility,
  } = data;

  const windDir = deg !== undefined ? getWindDirection(deg) : '';

  return (
    <article className="glass-card p-6 animate-fade-in" aria-label={`Current weather for ${name}`}>
      {/* ── Header: City + Badge ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getFlagEmoji(country)}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-shadow-lg leading-tight">
              {name}
            </h2>
          </div>
          {country && (
            <p className="text-white/60 text-sm mt-0.5">{country}</p>
          )}
        </div>

        {/* Condition badge */}
        <span className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 capitalize">
          {main}
        </span>
      </div>

      {/* ── Temp + Icon ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-7xl sm:text-8xl font-black text-white text-shadow-lg leading-none">
              {convertTemp(temp)}
            </span>
            <span className="text-3xl font-light text-white/70 mb-3">{unitSymbol}</span>
          </div>
          <p className="text-white/80 text-base mt-1 capitalize text-shadow">
            {capitalize(description)}
          </p>
          <p className="text-white/55 text-sm mt-0.5">
            Feels like {convertTemp(feels_like)}{unitSymbol}
          </p>
        </div>

        <WeatherIcon iconCode={icon} size="xl" className="flex-shrink-0 -mr-2" />
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
        <StatItem
          icon="💧"
          label="Humidity"
          value={`${humidity}%`}
        />
        <StatItem
          icon="💨"
          label="Wind"
          value={`${Math.round(speed * 3.6)} km/h ${windDir}`}
        />
        <StatItem
          icon="🌡️"
          label="Pressure"
          value={`${pressure} hPa`}
        />
        <StatItem
          icon="👁️"
          label="Visibility"
          value={visibility ? `${(visibility / 1000).toFixed(1)} km` : 'N/A'}
        />
      </div>

      {/* ── Sunrise / Sunset + Last Updated ────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
        <div className="flex items-center gap-4">
          {sunrise && (
            <span title="Sunrise">🌅 {formatTime(sunrise)}</span>
          )}
          {sunset && (
            <span title="Sunset">🌇 {formatTime(sunset)}</span>
          )}
        </div>
        {dt && (
          <span title="Last updated">
            Updated {timeAgo(dt * 1000)}
          </span>
        )}
      </div>
    </article>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-white/45 text-xs flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
