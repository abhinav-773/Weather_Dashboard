/**
 * components/TemperatureToggle.jsx
 * Toggles between Celsius and Fahrenheit.
 * Reads/writes TemperatureContext — no local state needed.
 */

import { useTemperature } from '@context/TemperatureContext';

export default function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperature();

  return (
    <button
      id="temperature-toggle"
      onClick={toggleUnit}
      aria-label={`Switch to ${unit === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
      className="btn-glass text-sm font-semibold min-w-[72px] justify-center"
      title="Toggle temperature unit"
    >
      <span className={`transition-all duration-200 ${unit === 'metric' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
        °C
      </span>
      <span className="text-slate-300 dark:text-white/30 font-light">|</span>
      <span className={`transition-all duration-200 ${unit === 'imperial' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
        °F
      </span>
    </button>
  );
}
