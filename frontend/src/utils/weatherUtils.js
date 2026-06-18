/**
 * utils/weatherUtils.js
 * Pure utility functions for weather data processing and display formatting.
 * No React dependencies — fully testable in isolation.
 */

// ─── Weather Condition → CSS Background Class ─────────────────────────────────

const CONDITION_MAP = {
  clear: 'weather-bg-clear',
  clouds: 'weather-bg-clouds',
  rain: 'weather-bg-rain',
  drizzle: 'weather-bg-rain',
  snow: 'weather-bg-snow',
  thunderstorm: 'weather-bg-thunderstorm',
  mist: 'weather-bg-mist',
  haze: 'weather-bg-mist',
  fog: 'weather-bg-mist',
  smoke: 'weather-bg-mist',
  dust: 'weather-bg-mist',
  sand: 'weather-bg-mist',
  ash: 'weather-bg-mist',
  squall: 'weather-bg-thunderstorm',
  tornado: 'weather-bg-thunderstorm',
};

/**
 * Returns the CSS class name for the dynamic weather background.
 * @param {object|null} currentWeather - OWM current weather response
 * @returns {string} CSS class name
 */
export const getWeatherBgClass = (currentWeather) => {
  if (!currentWeather?.weather?.[0]?.main) return 'weather-bg';
  const main = currentWeather.weather[0].main.toLowerCase();
  return CONDITION_MAP[main] || 'weather-bg';
};

// ─── Forecast Processing ──────────────────────────────────────────────────────

/**
 * Converts OWM 5-day/3-hour forecast (40 entries) into 5 daily summaries.
 * Picks midday (11:00–13:00) entry for icon/description; tracks daily high/low.
 *
 * @param {object|null} forecastData - OWM forecast response
 * @returns {Array<{ date: Date, dayLabel: string, high: number, low: number, icon: string, description: string, main: string }>}
 */
export const processForecastData = (forecastData) => {
  if (!forecastData?.list?.length) return [];

  const dailyMap = new Map();

  forecastData.list.forEach((item) => {
    const date    = new Date(item.dt * 1000);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD key

    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, {
        date,
        dateStr,
        high:        item.main.temp_max,
        low:         item.main.temp_min,
        icon:        item.weather[0].icon,
        description: item.weather[0].description,
        main:        item.weather[0].main,
        humidity:    item.main.humidity,
        windSpeed:   item.wind.speed,
      });
    } else {
      const day = dailyMap.get(dateStr);
      if (item.main.temp_max > day.high) day.high = item.main.temp_max;
      if (item.main.temp_min < day.low)  day.low  = item.main.temp_min;

      // Prefer midday (11:00–13:00) for representative icon/description
      const hour = date.getHours();
      if (hour >= 11 && hour <= 13) {
        day.icon        = item.weather[0].icon;
        day.description = item.weather[0].description;
        day.main        = item.weather[0].main;
      }
    }
  });

  return Array.from(dailyMap.values()).slice(0, 5);
};

// ─── Date / Time Formatting ───────────────────────────────────────────────────

/**
 * Format a Date object as a friendly day label.
 * @param {Date} date
 * @returns {string} "Today" | "Tomorrow" | "Mon" | "Tue" ...
 */
export const formatDayLabel = (date) => {
  const today    = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const d = new Date(date);
  if (d.toDateString() === today.toDateString())    return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Format a forecast date as "Mon 15" (abbreviated weekday + date number).
 * @param {Date} date
 * @returns {string}
 */
export const formatForecastDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    day:     'numeric',
  });
};

/**
 * Format a Unix timestamp to a human-readable time string.
 * @param {number} dt - Unix timestamp (seconds)
 * @returns {string} e.g. "14:35"
 */
export const formatTime = (dt) => {
  return new Date(dt * 1000).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Returns a relative time string for a timestamp.
 * @param {string|Date} timestamp
 * @returns {string} "just now" | "5m ago" | "2h ago" | "3d ago" | "Jan 15"
 */
export const timeAgo = (timestamp) => {
  const now  = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
};

// ─── Country Flag Emoji ───────────────────────────────────────────────────────

/**
 * Convert a 2-letter ISO country code to its flag emoji.
 * Uses Unicode Regional Indicator Symbol letters (U+1F1E6–U+1F1FF).
 * @param {string} countryCode - e.g. "GB", "US", "IN"
 * @returns {string} e.g. "🇬🇧"
 */
export const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');
};

// ─── Wind Direction ───────────────────────────────────────────────────────────

/**
 * Convert wind degrees to compass direction.
 * @param {number} deg
 * @returns {string} e.g. "NE", "SW"
 */
export const getWindDirection = (deg) => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

// ─── Capitalize ───────────────────────────────────────────────────────────────

/**
 * Capitalize the first letter of each word.
 * Used for OWM description strings ("broken clouds" → "Broken Clouds").
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};
