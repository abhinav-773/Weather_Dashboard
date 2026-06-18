/**
 * api/weatherApi.js
 * All weather-related API calls. Frontend never calls OWM directly.
 * All requests go through the Express backend proxy.
 */

import api from './axiosInstance';

/**
 * Fetch current weather + 5-day forecast in a single call (preferred).
 * @param {string} city
 * @returns {Promise<{ current: object, forecast: object }>}
 */
export const getDashboard = async (city) => {
  const { data } = await api.get('/api/weather/dashboard', { params: { city } });
  return data; // { success, data: { current, forecast } }
};

/**
 * Fetch only current weather.
 * @param {string} city
 */
export const getCurrentWeather = async (city) => {
  const { data } = await api.get('/api/weather/current', { params: { city } });
  return data;
};

/**
 * Fetch only the 5-day/3-hour forecast.
 * @param {string} city
 */
export const getForecast = async (city) => {
  const { data } = await api.get('/api/weather/forecast', { params: { city } });
  return data;
};

/**
 * Fetch current weather + forecast by geographic coordinates (geolocation flow).
 * @param {number} lat
 * @param {number} lon
 */
export const getWeatherByLocation = async (lat, lon) => {
  const { data } = await api.get('/api/weather/location', { params: { lat, lon } });
  return data;
};

/**
 * Fetch city autocomplete suggestions.
 * @param {string} q - Partial city name (minimum 2 chars recommended)
 * @returns {Promise<Array<{ name, country, state, lat, lon }>>}
 */
export const getSuggestions = async (q) => {
  const { data } = await api.get('/api/weather/suggestions', { params: { q } });
  return data;
};
