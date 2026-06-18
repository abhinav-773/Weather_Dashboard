/**
 * hooks/useHistory.js
 * Manages search history state: fetch, save, remove, and clear.
 * Optimistic UI for remove/clear (instant update, no waiting for server).
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getHistory,
  saveHistory,
  clearHistory,
  deleteHistoryItem,
  getStats,
} from '@api/historyApi';

export default function useHistory(limit = 10) {
  const [history, setHistory] = useState([]);
  const [stats, setStats]     = useState(null);   // { totalSearches, mostSearchedCity, mostSearchedCount, lastSearch }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /** Fetch history from the backend and update local state. */
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getHistory(limit);
      setHistory(response.data || []);
    } catch (err) {
      // Non-critical — silently fail so it doesn't break the weather display
      console.error('[useHistory] fetchHistory failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  /** Fetch aggregate analytics — non-blocking, silently fails. */
  const fetchStats = useCallback(async () => {
    try {
      const response = await getStats();
      setStats(response.data || null);
    } catch (err) {
      console.error('[useHistory] fetchStats failed:', err.message);
    }
  }, []);

  // Auto-fetch both on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [fetchHistory, fetchStats]);

  /**
   * Save a search to history and refresh the list + stats.
   * Called after every successful weather fetch.
   * @param {{ city_name: string, country?: string, latitude?: number, longitude?: number }} payload
   */
  const saveSearch = useCallback(async (payload) => {
    try {
      await saveHistory(payload);
      await Promise.all([fetchHistory(), fetchStats()]);
    } catch (err) {
      console.error('[useHistory] saveSearch failed:', err.message);
    }
  }, [fetchHistory, fetchStats]);

  /**
   * Optimistically remove a single item, then confirm with the server.
   * @param {string} id - UUID of the record to remove
   */
  const removeItem = useCallback(async (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteHistoryItem(id);
    } catch (err) {
      // Revert if server delete fails
      await fetchHistory();
      setError('Failed to remove item. Please try again.');
    }
  }, [fetchHistory]);

  /**
   * Optimistically clear all history, then confirm with the server.
   * Refreshes stats after successful clear.
   */
  const clearAll = useCallback(async () => {
    const previous = history;
    setHistory([]);
    setStats(null);
    try {
      await clearHistory();
      // Stats are now all zeros — reset cleanly
      setStats({ totalSearches: 0, mostSearchedCity: null, mostSearchedCount: 0, lastSearch: null });
    } catch (err) {
      setHistory(previous);
      await fetchStats();
      setError('Failed to clear history. Please try again.');
    }
  }, [history, fetchStats]);

  const clearError = useCallback(() => setError(null), []);

  return {
    history,
    stats,
    loading,
    error,
    saveSearch,
    removeItem,
    clearAll,
    refetch: fetchHistory,
    clearError,
  };
}
