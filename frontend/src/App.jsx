import { ThemeProvider } from '@context/ThemeContext';
import { TemperatureProvider } from '@context/TemperatureContext';
import Dashboard from '@pages/Dashboard';

/**
 * App.jsx — Root component.
 * Wraps the entire app in global context providers.
 * Order matters: ThemeProvider outermost so all children can read the theme.
 */
export default function App() {
  return (
    <ThemeProvider>
      <TemperatureProvider>
        <Dashboard />
      </TemperatureProvider>
    </ThemeProvider>
  );
}
