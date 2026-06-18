/**
 * middleware/requestValidation.js
 * Input validation rules using express-validator.
 * Each exported array is used as route-level middleware.
 */

const { query, body, param, validationResult } = require('express-validator');

/**
 * Middleware to evaluate validation results.
 * If any rule failed, responds with 400 and the list of errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Weather Validators ───────────────────────────────────────────────────────

const validateCityQuery = [
  query('city')
    .trim()
    .notEmpty().withMessage('City name is required.')
    .isLength({ min: 1, max: 100 }).withMessage('City name must be between 1 and 100 characters.')
    .matches(/^[a-zA-Z\s\-,.']+$/).withMessage('City name contains invalid characters.'),
  validate,
];

const validateCoordinates = [
  query('lat')
    .notEmpty().withMessage('Latitude is required.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90.'),
  query('lon')
    .notEmpty().withMessage('Longitude is required.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180.'),
  validate,
];

const validateSuggestionQuery = [
  query('q')
    .trim()
    .notEmpty().withMessage('Query parameter `q` is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Query must be between 1 and 100 characters.'),
  validate,
];

// ─── History Validators ───────────────────────────────────────────────────────

const validateSaveHistory = [
  body('city_name')
    .trim()
    .notEmpty().withMessage('city_name is required.')
    .isLength({ min: 1, max: 255 }).withMessage('city_name must not exceed 255 characters.'),
  body('country')
    .optional()
    .isLength({ max: 100 }).withMessage('country must not exceed 100 characters.'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90.'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('longitude must be between -180 and 180.'),
  validate,
];

const validateHistoryId = [
  param('id')
    .isUUID().withMessage('Invalid history ID format.'),
  validate,
];

module.exports = {
  validateCityQuery,
  validateCoordinates,
  validateSuggestionQuery,
  validateSaveHistory,
  validateHistoryId,
};
