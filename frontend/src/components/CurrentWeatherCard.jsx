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
      {/* ── Main Info ──────────────────────────────────────────────────── */}
      <div className="flex flex-col mb-8 relative">
        {/* Optional Condition Badge positioned absolutely on desktop, or right-aligned */}
        <div className="flex items-center justify-between mt-2 mb-8">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/15 dark:border-white/20 dark:text-white/90 capitalize shadow-sm">
            {description}
          </span>
        </div>

        {/* Massive temperature display + Icon side-by-side */}
        <div className="flex items-center gap-6 mb-8 mt-4">
          <WeatherIcon iconCode={icon} size="xl" className="w-32 h-32 object-contain drop-shadow-2xl animate-fade-in" />
          <div className="flex items-start">
            <span className="text-7xl sm:text-8xl font-black text-slate-900 dark:text-white dark:text-shadow-lg leading-none tracking-tighter">
              {convertTemp(temp)}
            </span>
            <span className="text-3xl font-light text-slate-500 dark:text-white/70 mt-1 ml-1">{unitSymbol}</span>
          </div>
        </div>

        {/* Location & Details */}
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white dark:text-shadow leading-tight flex items-center gap-2">
            {name}
            {country && (
              <span className="text-xl leading-none">{getFlagEmoji(country)}</span>
            )}
          </h2>
          <p className="text-slate-700 dark:text-white/90 text-lg mt-1.5 capitalize dark:text-shadow font-medium">
            {main}
          </p>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-0.5">
            Feels like {convertTemp(feels_like)}{unitSymbol}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
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
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-400 dark:text-white/40">
        <div className="flex items-center gap-4">
          {sunrise && (
            <span title="Sunrise" className="flex items-center gap-1">
              🌅 <span className="font-medium">Sunrise:</span> {formatTime(sunrise)}
            </span>
          )}
          {sunset && (
            <span title="Sunset" className="flex items-center gap-1">
              🌇 <span className="font-medium">Sunset:</span> {formatTime(sunset)}
            </span>
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
      <span className="text-slate-500 dark:text-white/45 text-xs flex items-center gap-1">
        <span>{icon}</span> {label}
      </span>
      <span className="text-slate-900 dark:text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
