/**
 * hooks/useDebounce.js
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of no changes. Used by SearchBar to throttle suggestion API calls.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 500)
 * @returns {*} Debounced value
 */

import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
