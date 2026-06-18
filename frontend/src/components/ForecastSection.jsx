/**
 * components/ForecastSection.jsx
 * Renders a 5-day forecast grid.
 * Processes raw OWM 40-entry list into daily summaries via processForecastData.
 * Shows skeleton tiles while loading.
 */

import ForecastCard from './ForecastCard';
import { ForecastCardSkeleton } from './LoadingSpinner';
import { processForecastData, formatDayLabel } from '@utils/weatherUtils';

/**
 * @param {{ data: object|null, loading: boolean }} props
 */
export default function ForecastSection({ data, loading }) {
  if (loading) {
    return (
      <section aria-label="5-day forecast loading" className="animate-fade-in">
        <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">
          5-Day Forecast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForecastCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!data) return null;

  const days = processForecastData(data);

  if (!days.length) return null;

  const today = new Date().toDateString();

  return (
    <section aria-label="5-day weather forecast" className="animate-fade-in">
      <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        5-Day Forecast
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {days.map((day, idx) => {
          const dayLabel = formatDayLabel(day.date);
          const isToday  = new Date(day.date).toDateString() === today;
          return (
            <ForecastCard
              key={day.dateStr}
              day={{ ...day, dayLabel }}
              isToday={isToday}
            />
          );
        })}
      </div>
    </section>
  );
}
