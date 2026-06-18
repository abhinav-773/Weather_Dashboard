/**
 * context/TemperatureContext.jsx
 * Provides global Celsius/Fahrenheit toggle state.
 * Temperature conversion is client-side — no API refetch needed.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const TemperatureContext = createContext(null);

export function TemperatureProvider({ children }) {
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('wd-unit') || 'metric';
  });

  const toggleUnit = useCallback(() => {
    setUnit((current) => {
      const next = current === 'metric' ? 'imperial' : 'metric';
      localStorage.setItem('wd-unit', next);
      return next;
    });
  }, []);

  /**
   * Convert a temperature value from Celsius (OWM always returns metric).
   * @param {number} celsius
   * @returns {number} Rounded integer in the active unit
   */
  const convertTemp = useCallback(
    (celsius) => {
      if (typeof celsius !== 'number') return '—';
      if (unit === 'imperial') return Math.round((celsius * 9) / 5 + 32);
      return Math.round(celsius);
    },
    [unit]
  );

  const unitSymbol = unit === 'metric' ? '°C' : '°F';

  return (
    <TemperatureContext.Provider value={{ unit, toggleUnit, convertTemp, unitSymbol }}>
      {children}
    </TemperatureContext.Provider>
  );
}

/**
 * @returns {{ unit: 'metric' | 'imperial', toggleUnit: () => void, convertTemp: (c: number) => number, unitSymbol: string }}
 */
export function useTemperature() {
  const ctx = useContext(TemperatureContext);
  if (!ctx) throw new Error('useTemperature must be used within a TemperatureProvider');
  return ctx;
}
