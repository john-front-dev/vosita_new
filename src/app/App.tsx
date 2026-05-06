import { AppProvider } from './providers';
import { AppRouter } from './router';

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
