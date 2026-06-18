/**
 * controllers/weatherController.js
 * Handles all incoming weather-related HTTP requests.
 * Delegates data fetching to weatherService.
 * Does NOT contain business logic — that lives in the service layer.
 *
 * Endpoints:
 *   GET /api/weather/current?city=
 *   GET /api/weather/forecast?city=
 *   GET /api/weather/dashboard?city=   ← current + forecast in one call
 *   GET /api/weather/location?lat=&lon=
 *   GET /api/weather/suggestions?q=
 */

const weatherService = require('../services/weatherService');

// ─── GET /api/weather/current?city=London ────────────────────────────────────
const getCurrentWeather = async (req, res, next) => {
  try {
    const { city } = req.query;
    const data = await weatherService.getCurrentWeatherByCity(city);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/weather/forecast?city=London ───────────────────────────────────
const getForecast = async (req, res, next) => {
  try {
    const { city } = req.query;
    const data = await weatherService.getForecastByCity(city);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/weather/dashboard?city=London ────────────────────────────────
/**
 * Returns both current weather AND 5-day forecast in a single response.
 * Eliminates two round-trips from the frontend for the primary use case.
 */
const getDashboard = async (req, res, next) => {
  try {
    const { city } = req.query;
    const [current, forecast] = await Promise.all([
      weatherService.getCurrentWeatherByCity(city),
      weatherService.getForecastByCity(city),
    ]);
    res.status(200).json({ success: true, data: { current, forecast } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/weather/location?lat=12.9&lon=77.5 ────────────────────────────
const getWeatherByLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    const [currentData, forecastData] = await Promise.all([
      weatherService.getCurrentWeatherByCoords(parseFloat(lat), parseFloat(lon)),
      weatherService.getForecastByCoords(parseFloat(lat), parseFloat(lon)),
    ]);

    res.status(200).json({
      success: true,
      data: {
        current: currentData,
        forecast: forecastData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/weather/suggestions?q=Lon ─────────────────────────────────────
const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await weatherService.getCitySuggestions(q);
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getForecast,
  getDashboard,
  getWeatherByLocation,
  getSuggestions,
};
