/**
 * api/historyApi.js
 * All search history CRUD operations against the Express backend.
 */

import api from './axiosInstance';

/**
 * Fetch recent search history.
 * @param {number} limit - Max records to return (default 10, max 50)
 */
export const getHistory = async (limit = 10) => {
  const { data } = await api.get('/api/history', { params: { limit } });
  return data; // { success, data: [...], meta: { limit, count } }
};

/**
 * Persist a new search entry (or bump searched_at if city already exists).
 * @param {{ city_name: string, country?: string, latitude?: number, longitude?: number }} payload
 */
export const saveHistory = async (payload) => {
  const { data } = await api.post('/api/history', payload);
  return data;
};

/**
 * Clear all search history records.
 */
export const clearHistory = async () => {
  const { data } = await api.delete('/api/history');
  return data;
};

/**
 * Delete a single search history record by UUID.
 * @param {string} id
 */
export const deleteHistoryItem = async (id) => {
  const { data } = await api.delete(`/api/history/${id}`);
  return data;
};

/**
 * Fetch aggregate search analytics.
 * @returns {Promise<{ totalSearches: number, mostSearchedCity: string|null, mostSearchedCount: number, lastSearch: string|null }>}
 */
export const getStats = async () => {
  const { data } = await api.get('/api/history/stats');
  return data; // { success, data: { totalSearches, mostSearchedCity, mostSearchedCount, lastSearch } }
};
