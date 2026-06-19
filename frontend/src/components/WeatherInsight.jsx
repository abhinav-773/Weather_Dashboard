import { useTemperature } from '@context/TemperatureContext';

export default function WeatherInsight({ data, loading }) {
  const { convertTemp, unitSymbol } = useTemperature();

  if (loading) return null; // We could add a skeleton later if needed
  if (!data) return null;

  const {
    main: { temp, feels_like, humidity } = {},
    weather: [{ id: conditionId } = {}] = [],
    wind: { speed } = {}, // speed is usually m/s when using metric
  } = data;

  const insights = [];

  // 1. Temperature vs Feels Like Insight
  const tempDiff = Math.abs(feels_like - temp);
  if (tempDiff >= 1) { // Only show if difference is noticeable
    // convertTemp returns a string (e.g., "24" or "24.5"). We parse it to do math if needed,
    // but easier to just convert both and find the difference in the current unit.
    const convertedTemp = parseFloat(convertTemp(temp));
    const convertedFeelsLike = parseFloat(convertTemp(feels_like));
    
    let diff = Math.abs(convertedFeelsLike - convertedTemp).toFixed(0);
    if (diff === "0" && tempDiff >= 1) diff = "1"; // Ensure we don't say 0 if actual diff >= 1

    if (feels_like > temp) {
      insights.push({ icon: '🌡️', text: `Feels ${diff}${unitSymbol} warmer than actual temperature.` });
    } else {
      insights.push({ icon: '🌡️', text: `Feels ${diff}${unitSymbol} colder than actual temperature.` });
    }
  }

  // 2. Humidity Insight
  if (humidity > 70) {
    insights.push({ icon: '💧', text: `Humidity is high (${humidity}%).` });
  } else if (humidity < 30) {
    insights.push({ icon: '💧', text: `Humidity is very low (${humidity}%).` });
  }

  // 3. Rain / Snow / Condition Insight
  // Condition codes: 2xx Thunderstorm, 3xx Drizzle, 5xx Rain, 6xx Snow
  if (conditionId >= 200 && conditionId < 600) {
    insights.push({ icon: '☂️', text: 'Carry an umbrella today.' });
  } else if (conditionId >= 600 && conditionId < 700) {
    insights.push({ icon: '❄️', text: 'It\'s snowing! Bundle up and stay safe.' });
  } else if (conditionId === 800 && temp > 25) {
    insights.push({ icon: '🧴', text: 'Clear skies. Don\'t forget your sunscreen.' });
  }

  // 4. Wind Insight (speed > 10 m/s is ~36 km/h)
  if (speed > 10) {
    insights.push({ icon: '💨', text: 'It\'s quite windy today.' });
  }

  // Fallback if no specific insights match
  if (insights.length === 0) {
    if (temp > 20 && temp < 28) {
      insights.push({ icon: '✨', text: 'Perfect weather conditions today.' });
    } else {
      insights.push({ icon: '🌤️', text: 'Weather looks relatively stable.' });
    }
  }

  return (
    <article className="glass-card p-6 animate-fade-in" aria-label="Weather Insights">
      <h3 className="text-slate-700 dark:text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
        Weather Insight
      </h3>
      <ul className="space-y-3">
        {insights.map((insight, idx) => (
          <li key={idx} className="text-slate-900 dark:text-white/90 font-medium text-[15px] flex items-center gap-2.5">
            <span className="text-lg leading-none">{insight.icon}</span>
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
