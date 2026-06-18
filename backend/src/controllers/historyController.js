/**
 * controllers/historyController.js
 * Handles CRUD operations for search history stored in PostgreSQL.
 * Uses parameterized queries to prevent SQL injection.
 *
 * Endpoints:
 *   GET  /api/history            — list recent searches (limit param)
 *   GET  /api/history/stats      — aggregate analytics
 *   POST /api/history            — save / upsert a search
 *   DELETE /api/history          — clear all
 *   DELETE /api/history/:id      — delete single record
 */

const { pool } = require('../db/pool');

// ─── GET /api/history ────────────────────────────────────────────────────────
/**
 * Returns recent searches ordered by most recent.
 * Accepts optional ?limit query param (default: 10, max: 50).
 */
const getHistory = async (req, res, next) => {
  try {
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const { rows } = await pool.query(
      `SELECT id, city_name, country, latitude, longitude, searched_at
       FROM search_history
       ORDER BY searched_at DESC
       LIMIT $1`,
      [limit]
    );
    res.status(200).json({ success: true, data: rows, meta: { limit, count: rows.length } });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/history ───────────────────────────────────────────────────────
/**
 * Saves a new search entry to the database.
 * Body: { city_name, country, latitude, longitude }
 * Uses UPSERT to avoid duplicates — updates searched_at if city already exists.
 */
const saveHistory = async (req, res, next) => {
  try {
    const { city_name, country, latitude, longitude } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO search_history (city_name, country, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING id, city_name, country, latitude, longitude, searched_at`,
      [city_name, country || null, latitude || null, longitude || null]
    );

    // If nothing was returned (duplicate was silently skipped),
    // fetch the existing record and bump its timestamp.
    if (rows.length === 0) {
      const { rows: updated } = await pool.query(
        `UPDATE search_history
         SET searched_at = CURRENT_TIMESTAMP
         WHERE city_name = $1
         RETURNING id, city_name, country, latitude, longitude, searched_at`,
        [city_name]
      );
      return res.status(200).json({ success: true, data: updated[0] });
    }

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/history ─────────────────────────────────────────────────────
/**
 * Clears all search history records from the database.
 */
const clearHistory = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM search_history');
    res.status(200).json({ success: true, message: 'Search history cleared.' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/history/:id ─────────────────────────────────────────────────
/**
 * Deletes a single search history record by UUID.
 */
const deleteHistoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rowCount } = await pool.query(
      'DELETE FROM search_history WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    res.status(200).json({ success: true, message: 'Record deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/history/stats ──────────────────────────────────────────────────
/**
 * Returns aggregate analytics across all search history.
 * Three parallel queries — each hits a covered index.
 *
 * Response: { totalSearches, mostSearchedCity, mostSearchedCount, lastSearch }
 */
const getStats = async (req, res, next) => {
  try {
    const [totalResult, topCityResult, lastResult] = await Promise.all([
      // Total row count
      pool.query('SELECT COUNT(*)::int AS total FROM search_history'),

      // Most searched city (by row frequency — each saved search = one row)
      pool.query(`
        SELECT city_name, COUNT(*) AS search_count
        FROM   search_history
        GROUP  BY city_name
        ORDER  BY search_count DESC
        LIMIT  1
      `),

      // Most recently searched city
      pool.query(`
        SELECT city_name
        FROM   search_history
        ORDER  BY searched_at DESC
        LIMIT  1
      `),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSearches:      totalResult.rows[0]?.total           || 0,
        mostSearchedCity:   topCityResult.rows[0]?.city_name     || null,
        mostSearchedCount:  parseInt(topCityResult.rows[0]?.search_count, 10) || 0,
        lastSearch:         lastResult.rows[0]?.city_name        || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  saveHistory,
  clearHistory,
  deleteHistoryItem,
  getStats,
};
