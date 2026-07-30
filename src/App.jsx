import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./layouts/Sidebar";
import Dashboard from "./pages/Dashboard";
import TickerDetail from "./pages/TickerDetail";
import Glossary from "./pages/Glossary";
import Settings from "./pages/Settings";
import Compare from "./pages/Compare";
import BuyCheck from "./pages/BuyCheck";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/buy" element={<BuyCheck />} />
            <Route path="/ticker/:ticker" element={<TickerDetail />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
