import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./layouts/Sidebar";
import Dashboard from "./pages/Dashboard";
import TickerDetail from "./pages/TickerDetail";
import Glossary from "./pages/Glossary";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ticker/:ticker" element={<TickerDetail />} />
            <Route path="/glossary" element={<Glossary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
