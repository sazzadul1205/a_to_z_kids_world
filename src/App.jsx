import "./App.css";
import Footer from "./Shared/Footer";
import Navbar from "./Shared/Navbar";
import { ThemeProvider } from "./Shared/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <main className="flex min-h-screen flex-col bg-surface text-text transition-colors duration-300">
        <Navbar />

        <div className="flex-1">{/* Page content will go here */}</div>

        <Footer />
      </main>
    </ThemeProvider>
  );
}

export default App;
