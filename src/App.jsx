import AppRoutes from "./routes/appRoutes";
import { useAccentColor } from "./hooks/useAccentColor";

function App() {
  useAccentColor(); /* applies data-accent to <html> on mount + persists */
  return <AppRoutes />;
}

export default App;
