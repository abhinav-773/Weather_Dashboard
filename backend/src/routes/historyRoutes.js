/**
 * routes/historyRoutes.js
 * Defines all /api/history/** endpoints.
 */

const { Router } = require('express');
const {
  getHistory,
  saveHistory,
  clearHistory,
  deleteHistoryItem,
  getStats,
} = require('../controllers/historyController');
const {
  validateSaveHistory,
  validateHistoryId,
} = require('../middleware/requestValidation');

const router = Router();

// GET /api/history  — fetch recent searches (supports ?limit)
router.get('/', getHistory);

// GET /api/history/stats  — aggregate analytics
// ⚠ Must be defined BEFORE /:id to avoid Express treating "stats" as a UUID param
router.get('/stats', getStats);

// POST /api/history  — save a new search
router.post('/', validateSaveHistory, saveHistory);

// DELETE /api/history  — clear all history
router.delete('/', clearHistory);

// DELETE /api/history/:id  — remove a single record by UUID
router.delete('/:id', validateHistoryId, deleteHistoryItem);

module.exports = router;
