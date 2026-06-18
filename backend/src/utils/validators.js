/**
 * utils/validators.js
 * Pure utility functions for common validation logic.
 * Separated from Express middleware to allow reuse in tests or services.
 */

/**
 * Check if a latitude value is valid.
 * @param {number|string} lat
 * @returns {boolean}
 */
const isValidLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Check if a longitude value is valid.
 * @param {number|string} lon
 * @returns {boolean}
 */
const isValidLongitude = (lon) => {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Sanitize a city name input string.
 * @param {string} city
 * @returns {string}
 */
const sanitizeCityName = (city) => {
  if (typeof city !== 'string') return '';
  return city.trim().replace(/\s+/g, ' ');
};

module.exports = { isValidLatitude, isValidLongitude, sanitizeCityName };
