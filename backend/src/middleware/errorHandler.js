/**
 * middleware/errorHandler.js
 * Centralized Express error handling middleware.
 * Must be registered LAST in app.js (after all routes).
 * Ensures no stack traces leak to the client.
 */

const errorHandler = (err, req, res, _next) => {
  // Use statusCode attached by service layer, or fall back to 500
  const statusCode = err.statusCode || err.status || 500;

  // Log full error server-side for debugging
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  } else {
    console.warn(`[WARN] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  }

  // Send sanitized response to the client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
