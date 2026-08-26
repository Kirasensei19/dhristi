import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Locations from "./pages/Locations";
import Hazards from "./pages/Hazards";
import Predictions from "./pages/Predictions";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>⚠ HazardAI</h2>

          <nav>
            <Link to="/">🏠 Dashboard</Link>
            <Link to="/locations">📍 Locations</Link>
            <Link to="/hazards">⚠ Hazards</Link>
            <Link to="/predictions">📊 Predictions</Link>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/hazards" element={<Hazards />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;