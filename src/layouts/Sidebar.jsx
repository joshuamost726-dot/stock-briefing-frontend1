import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getJSON } from "../api";

export default function Sidebar() {
  const location = useLocation();
  const [tickers, setTickers] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getJSON("/api/stocks")
      .then(stocks => setTickers(stocks.map(s => s.ticker)))
      .catch(() => {}); // sidebar nav is supplementary — a failure here shouldn't block anything
  }, [location.pathname]); // refetch on navigation so stocks added/removed via Settings show up without a full reload

  // Close the mobile drawer whenever the route changes — otherwise it stays
  // open covering the new page after tapping a link.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `sidebar-link${isActive(path) ? ' sidebar-link-active' : ''}`;

  return (
    <>
      <div className="mobile-topbar">
        <button className="mobile-menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <span className="mobile-topbar-logo">
          <span className="sidebar-logo-mark">📊</span>
          Briefing
        </span>
      </div>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <div className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark">📊</span>
          Briefing
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Overview</span>
          <Link to="/" className={linkClass('/')}>Dashboard</Link>
          <Link to="/compare" className={linkClass('/compare')}>Compare</Link>
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
    </>
  );
}
