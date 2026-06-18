/**
 * components/ForecastCard.jsx
 * Single-day forecast tile.
 * Displays: day label, date, weather icon, condition, high/low temperatures.
 */

import WeatherIcon from './WeatherIcon';
import { useTemperature } from '@context/TemperatureContext';
import { capitalize, formatForecastDate } from '@utils/weatherUtils';

/**
 * @param {{
 *   day: { date: Date, dayLabel: string, high: number, low: number,
 *           icon: string, description: string },
 *   isToday?: boolean
 * }} props
 */
export default function ForecastCard({ day, isToday = false }) {
  const { convertTemp, unitSymbol } = useTemperature();

  return (
    <article
      className={`glass-card p-4 flex flex-col items-center gap-2 text-center transition-all duration-200
        ${isToday ? 'ring-2 ring-sky-400 dark:ring-1 dark:ring-white/30 scale-[1.02]' : ''}`}
      aria-label={`${day.dayLabel} forecast`}
    >
      {/* Day label */}
      <span className={`text-xs font-bold uppercase tracking-wider
        ${isToday ? 'text-sky-600 dark:text-white' : 'text-slate-500 dark:text-white/70'}`}>
        {day.dayLabel}
      </span>

      {/* Date */}
      <span className="text-slate-400 dark:text-white/40 text-xs">
        {formatForecastDate(day.date)}
      </span>

      {/* Icon */}
      <WeatherIcon iconCode={day.icon} size="md" />

      {/* Condition */}
      <span className="text-slate-600 dark:text-white/70 text-xs leading-tight capitalize min-h-[2rem] flex items-center">
        {capitalize(day.description)}
      </span>

      {/* High / Low */}
      <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-slate-900 dark:text-white font-bold text-lg">
          {convertTemp(day.high)}{unitSymbol}
        </span>
        <span className="text-slate-500 dark:text-white/45 text-sm">
          {convertTemp(day.low)}{unitSymbol}
        </span>
      </div>
    </article>
  );
}
