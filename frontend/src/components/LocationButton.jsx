/**
 * components/LocationButton.jsx
 * Triggers browser geolocation and calls onLocate(lat, lon) on success.
 * Shows spinner while the browser is acquiring position.
 */

import LoadingSpinner from './LoadingSpinner';

/**
 * @param {{ onLocate: (lat: number, lon: number) => void, loading: boolean }} props
 */
export default function LocationButton({ onLocate, loading }) {
  return (
    <button
      id="location-button"
      onClick={onLocate}
      disabled={loading}
      aria-label="Use my current location"
      title="Use my current location"
      className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z"
          />
        </svg>
      )}
      <span className="hidden sm:inline text-sm font-medium">
        {loading ? 'Locating…' : 'My Location'}
      </span>
    </button>
  );
}
