/**
 * utils/responseFormatter.js
 * Utility functions to standardize API response shapes.
 */

/**
 * Format a successful response payload.
 * @param {object} res - Express response object
 * @param {number} statusCode
 * @param {*} data
 * @param {string} [message]
 */
const sendSuccess = (res, statusCode = 200, data = null, message = '') => {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== null) payload.data = data;
  res.status(statusCode).json(payload);
};

/**
 * Format an error response payload.
 * @param {object} res - Express response object
 * @param {number} statusCode
 * @param {string} message
 * @param {Array} [errors] - Optional field-level error list
 */
const sendError = (res, statusCode = 500, message = 'An error occurred.', errors = []) => {
  const payload = { success: false, message };
  if (errors.length) payload.errors = errors;
  res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
