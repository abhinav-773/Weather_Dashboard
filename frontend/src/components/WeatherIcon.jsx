/**
 * components/WeatherIcon.jsx
 * Renders an OpenWeatherMap weather icon from the icon code.
 * Falls back to an emoji if the icon fails to load.
 */

const EMOJI_FALLBACKS = {
  '01': '☀️', '02': '⛅', '03': '🌥️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️',
};

const getFallback = (iconCode) => {
  if (!iconCode) return '🌡️';
  const prefix = iconCode.slice(0, 2);
  return EMOJI_FALLBACKS[prefix] || '🌡️';
};

/**
 * @param {{ iconCode: string, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }} props
 */
export default function WeatherIcon({ iconCode, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (!iconCode) {
    return (
      <span className={`${sizeMap[size]} flex items-center justify-center text-3xl ${className}`}>
        {getFallback(iconCode)}
      </span>
    );
  }

  return (
    <img
      src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
      alt="weather icon"
      className={`${sizeMap[size]} object-contain drop-shadow-lg ${className}`}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  );
}
