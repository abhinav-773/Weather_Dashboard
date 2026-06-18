/**
 * api/axiosInstance.js
 * Pre-configured Axios client for all backend requests.
 * Base URL is read from the Vite environment variable VITE_API_BASE_URL.
 * Interceptors add request logging (dev) and normalize error responses.
 */

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error message — prefer backend's message over generic axios message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.data = error.response?.data;
    return Promise.reject(normalizedError);
  }
);

export default axiosInstance;
