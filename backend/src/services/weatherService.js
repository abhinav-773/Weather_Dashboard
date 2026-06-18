/**
 * services/weatherService.js
 * Encapsulates all OpenWeatherMap API interactions.
 * Controllers call this service — never call OpenWeatherMap directly elsewhere.
 */

const axios = require('axios');

const BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org';
const API_KEY  = process.env.OPENWEATHER_API_KEY;

/**
 * Create a pre-configured Axios instance for OpenWeatherMap.
 */
const owmClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: { appid: API_KEY, units: 'metric' },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map OpenWeatherMap error codes to user-friendly messages.
 * @param {import('axios').AxiosError} error
 * @returns {{ status: number, message: string }}
 */
const handleOwmError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const owmMessage = error.response.data?.message || '';

    if (status === 404 || owmMessage.toLowerCase().includes('not found')) {
      return { status: 404, message: 'City not found. Please check the spelling and try again.' };
    }
    if (status === 401) {
      return { status: 500, message: 'Weather service configuration error. Please contact support.' };
    }
    if (status === 429) {
      return { status: 429, message: 'Too many requests. Please wait a moment and try again.' };
    }
    return { status: 502, message: 'Weather service returned an unexpected error.' };
  }

  if (error.request) {
    return { status: 503, message: 'Unable to reach the weather service. Please check your connection.' };
  }

  return { status: 500, message: 'An unexpected error occurred.' };
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Fetch current weather by city name.
 * @param {string} city
 * @returns {Promise<object>}
 */
const getCurrentWeatherByCity = async (city) => {
  try {
    const { data } = await owmClient.get('/data/2.5/weather', {
      params: { q: city },
    });
    return data;
  } catch (error) {
    const { status, message } = handleOwmError(error);
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
};

/**
 * Fetch 5-day / 3-hour forecast by city name.
 * @param {string} city
 * @returns {Promise<object>}
 */
const getForecastByCity = async (city) => {
  try {
    const { data } = await owmClient.get('/data/2.5/forecast', {
      params: { q: city },
    });
    return data;
  } catch (error) {
    const { status, message } = handleOwmError(error);
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
};

/**
 * Fetch current weather by geographic coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
const getCurrentWeatherByCoords = async (lat, lon) => {
  try {
    const { data } = await owmClient.get('/data/2.5/weather', {
      params: { lat, lon },
    });
    return data;
  } catch (error) {
    const { status, message } = handleOwmError(error);
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
};

/**
 * Fetch 5-day forecast by geographic coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
const getForecastByCoords = async (lat, lon) => {
  try {
    const { data } = await owmClient.get('/data/2.5/forecast', {
      params: { lat, lon },
    });
    return data;
  } catch (error) {
    const { status, message } = handleOwmError(error);
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
};

/**
 * Fetch city autocomplete suggestions using the Geocoding API.
 * @param {string} query  - Partial city name (e.g. "Lon")
 * @param {number} limit  - Max suggestions (default 5)
 * @returns {Promise<Array>}
 */
const getCitySuggestions = async (query, limit = 5) => {
  try {
    const { data } = await owmClient.get('/geo/1.0/direct', {
      params: { q: query, limit },
    });
    return data;
  } catch (error) {
    const { status, message } = handleOwmError(error);
    const err = new Error(message);
    err.statusCode = status;
    throw err;
  }
};

module.exports = {
  getCurrentWeatherByCity,
  getForecastByCity,
  getCurrentWeatherByCoords,
  getForecastByCoords,
  getCitySuggestions,
};
