/**
 * hooks/useWeather.js
 * Manages weather data state: fetching, loading, and errors.
 * Uses /api/weather/dashboard for city-based searches (single round-trip).
 * Uses /api/weather/location for geolocation-based searches.
 */

import { useState, useCallback } from 'react';
import { getDashboard, getWeatherByLocation } from '@api/weatherApi';

export default function useWeather() {
  const [current, setCurrent]   = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  /**
   * Fetch weather data for a city name.
   * Returns the { current, forecast } data on success so callers can chain.
   * @param {string} city
   */
  const fetchByCity = useCallback(async (city) => {
    if (!city?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard(city.trim());
      const { current: c, forecast: f } = response.data;
      setCurrent(c);
      setForecast(f);
      return { current: c, forecast: f };
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
      setCurrent(null);
      setForecast(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch weather data by geographic coordinates (geolocation flow).
   * @param {number} lat
   * @param {number} lon
   */
  const fetchByCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWeatherByLocation(lat, lon);
      const { current: c, forecast: f } = response.data;
      setCurrent(c);
      setForecast(f);
      return { current: c, forecast: f };
    } catch (err) {
      setError(err.message || 'Failed to fetch weather for your location.');
      setCurrent(null);
      setForecast(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear any displayed error */
  const clearError = useCallback(() => setError(null), []);

  return { current, forecast, loading, error, fetchByCity, fetchByCoords, clearError };
}
