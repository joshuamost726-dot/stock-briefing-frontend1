import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getJSON } from "../api";

export default function Sidebar() {
  const location = useLocation();
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    getJSON("/api/stocks")
      .then(stocks => setTickers(stocks.map(s => s.ticker)))
      .catch(() => {}); // sidebar nav is supplementary — a failure here shouldn't block anything
  }, [location.pathname]); // refetch on navigation so stocks added/removed via Settings show up without a full reload

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `sidebar-link${isActive(path) ? ' sidebar-link-active' : ''}`;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">📊</span>
        Briefing
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Overview</span>
        <Link to="/" className={linkClass('/')}>Dashboard</Link>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Tickers</span>
        {tickers.map((ticker) => (
          <Link
            key={ticker}
            to={`/ticker/${ticker}`}
            className={`${linkClass(`/ticker/${ticker}`)} sidebar-ticker`}
          >
            {ticker}
          </Link>
        ))}
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Reference</span>
        <Link to="/glossary" className={linkClass('/glossary')}>Glossary</Link>
        <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
      </div>
    </div>
  );
}
