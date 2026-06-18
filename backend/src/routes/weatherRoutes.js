/**
 * routes/weatherRoutes.js
 * Defines all /api/weather/** endpoints.
 * Applies per-route validation before handing off to the controller.
 */

const { Router } = require('express');
const {
  getCurrentWeather,
  getForecast,
  getDashboard,
  getWeatherByLocation,
  getSuggestions,
} = require('../controllers/weatherController');
const {
  validateCityQuery,
  validateCoordinates,
  validateSuggestionQuery,
} = require('../middleware/requestValidation');

const router = Router();

// GET /api/weather/current?city=London
router.get('/current', validateCityQuery, getCurrentWeather);

// GET /api/weather/forecast?city=London
router.get('/forecast', validateCityQuery, getForecast);

// GET /api/weather/dashboard?city=London  — current + forecast in one call
router.get('/dashboard', validateCityQuery, getDashboard);

// GET /api/weather/location?lat=12.9&lon=77.5
router.get('/location', validateCoordinates, getWeatherByLocation);

// GET /api/weather/suggestions?q=Lon
router.get('/suggestions', validateSuggestionQuery, getSuggestions);

module.exports = router;
