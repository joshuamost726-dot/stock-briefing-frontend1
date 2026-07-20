import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./layouts/Sidebar";
import Dashboard from "./pages/Dashboard";
import TickerDetail from "./pages/TickerDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ticker/:ticker" element={<TickerDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
