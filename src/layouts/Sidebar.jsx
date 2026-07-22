import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const tickers = ['RILY', 'SKHY', 'ASTS', 'LRCX', 'QCOM', 'CWBHF'];

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
      </div>
    </div>
  );
}
