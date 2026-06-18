/**
 * pages/Dashboard.jsx
 * Root page — composes all components and orchestrates all state flows:
 *   A. City search (debounced autocomplete → weather fetch → history save)
 *   B. Geolocation search
 *   C. History re-search (click a past item)
 *   D. History management (remove item, clear all)
 *   E. Auto-load last searched city on startup
 *   F. Light/Dark theme toggle
 *   G. Celsius/Fahrenheit toggle
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import useWeather     from '@hooks/useWeather';
import useHistory     from '@hooks/useHistory';
import useGeolocation from '@hooks/useGeolocation';
import { useTheme }   from '@context/ThemeContext';

import SearchBar          from '@components/SearchBar';
import CurrentWeatherCard from '@components/CurrentWeatherCard';
import ForecastSection    from '@components/ForecastSection';
import SearchHistory      from '@components/SearchHistory';
import TemperatureToggle  from '@components/TemperatureToggle';
import LocationButton     from '@components/LocationButton';
import ErrorMessage       from '@components/ErrorMessage';

import { getWeatherBgClass } from '@utils/weatherUtils';

export default function Dashboard() {
  const { theme, toggleTheme, isDark } = useTheme();

  // ─── Core hooks ─────────────────────────────────────────────────────────────
  const {
    current, forecast, loading: weatherLoading, error: weatherError,
    fetchByCity, fetchByCoords, clearError: clearWeatherError,
  } = useWeather();

  const {
    history, stats, loading: historyLoading, saveSearch, removeItem, clearAll,
  } = useHistory(10);

  const {
    loading: geoLoading, error: geoError, getLocation, clearError: clearGeoError,
  } = useGeolocation();

  // Track whether the app has done its initial auto-load
  const autoLoaded = useRef(false);

  // ─── Auto-load last searched city on startup ─────────────────────────────
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;

    // history is populated asynchronously by useHistory; give it a tick
    const timer = setTimeout(async () => {
      if (history.length > 0) {
        const lastCity = history[0].city_name;
        try {
          await fetchByCity(lastCity);
        } catch {
          // Silently fail — empty state is acceptable on startup error
        }
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // ─── Flow A: City search ─────────────────────────────────────────────────
  const handleSearch = useCallback(async (cityName) => {
    try {
      const result = await fetchByCity(cityName);
      if (result) {
        const { current: c } = result;
        await saveSearch({
          city_name: c.name,
          country:   c.sys?.country   || null,
          latitude:  c.coord?.lat     || null,
          longitude: c.coord?.lon     || null,
        });
      }
    } catch {
      // Error already set in useWeather — no double-handling needed
    }
  }, [fetchByCity, saveSearch]);

  // ─── Flow B: Geolocation search ──────────────────────────────────────────
  const handleLocate = useCallback(() => {
    getLocation(async (lat, lon) => {
      try {
        const result = await fetchByCoords(lat, lon);
        if (result) {
          const { current: c } = result;
          await saveSearch({
            city_name: c.name,
            country:   c.sys?.country || null,
            latitude:  lat,
            longitude: lon,
          });
        }
      } catch {
        // Error handled in useWeather
      }
    });
  }, [getLocation, fetchByCoords, saveSearch]);

  // ─── Flow C: History re-search ────────────────────────────────────────────
  const handleHistorySelect = useCallback((cityName) => {
    handleSearch(cityName);
  }, [handleSearch]);

  // ─── Dynamic background class ─────────────────────────────────────────────
  const bgClass = getWeatherBgClass(current);

  return (
    <div className={`weather-bg ${bgClass} transition-all duration-1000`}>
      {/* Full-height content wrapper */}
      <div className="min-h-screen flex flex-col">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-2xl">🌤</span>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg leading-tight text-shadow">
                  WeatherMind
                </h1>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LocationButton onLocate={handleLocate} loading={geoLoading} />
              <TemperatureToggle />
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">

            {/* Search bar — full width */}
            <div className="mb-6">
              <SearchBar onSearch={handleSearch} loading={weatherLoading} />
            </div>

            {/* Error messages */}
            {(weatherError || geoError) && (
              <div className="mb-4 space-y-2">
                {weatherError && (
                  <ErrorMessage
                    message={weatherError}
                    onDismiss={clearWeatherError}
                    onRetry={current ? undefined : undefined}
                  />
                )}
                {geoError && (
                  <ErrorMessage
                    message={geoError}
                    onDismiss={clearGeoError}
                  />
                )}
              </div>
            )}

            {/* Dashboard layout: main content + history sidebar */}
            <div className="dashboard-layout">

              {/* ── Left / Main column ──────────────────────────────────── */}
              <div className="space-y-4">
                {/* Empty state — nothing searched yet */}
                {!weatherLoading && !current && !weatherError && (
                  <EmptyState />
                )}

                <CurrentWeatherCard data={current} loading={weatherLoading} />
                <ForecastSection    data={forecast} loading={weatherLoading} />
              </div>

              {/* ── Right / Sidebar ─────────────────────────────────────── */}
              <div className="lg:sticky lg:top-24">
                <SearchHistory
                  history={history}
                  stats={stats}
                  loading={historyLoading}
                  onSelect={handleHistorySelect}
                  onRemove={removeItem}
                  onClear={clearAll}
                />
              </div>
            </div>
          </div>
        </main>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="text-center py-4 text-white/25 text-xs">
          <p>WeatherMind</p>
        </footer>
      </div>
    </div>
  );
}

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      id="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className="btn-glass w-10 h-10 p-0 justify-center rounded-xl"
    >
      {isDark ? (
        /* Sun icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="glass-card p-10 text-center animate-fade-in">
      <div className="text-6xl mb-4 animate-pulse-slow">🌤</div>
      <h2 className="text-white text-xl font-semibold mb-2">Check the weather anywhere</h2>
      <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
        Search for a city above, use your current location, or click a recent search to get started.
      </p>
    </div>
  );
}
