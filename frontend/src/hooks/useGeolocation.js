/**
 * hooks/useGeolocation.js
 * Wraps the browser Geolocation API with React state management.
 * Handles all three error codes with specific user-friendly messages.
 */

import { useState, useCallback } from 'react';

export default function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /**
   * Request the user's current location and invoke the success callback.
   * @param {(lat: number, lon: number) => void} onSuccess
   */
  const getLocation = useCallback((onSuccess) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onSuccess(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access was denied. Please search manually or allow location in browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Your location is currently unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('Unable to retrieve your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache location for 5 minutes
      }
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, getLocation, clearError };
}
