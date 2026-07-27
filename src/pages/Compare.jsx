import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../api";
import Sparkline from "../components/Sparkline";
import { DashboardSkeleton } from "../components/Skeleton";

function tierOf(score) {
  if (score >= 70) return { label: "High", action: "BUY", cls: "high" };
  if (score >= 50) return { label: "Moderate", action: "HOLD", cls: "moderate" };
  return { label: "Low", action: "SELL", cls: "low" };
}

const MAX_SELECTED = 4;

export default function Compare() {
  const [stocks, setStocks] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    getJSON("/api/briefing/latest")
      .then(data => {
        const list = data.stocks || [];
        setStocks(list);
        setSelected(list.slice(0, MAX_SELECTED).map(s => s.ticker));
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="dashboard">
        <h1>Compare</h1>
        <div className="state-card state-card-error">
          <svg viewBox="0 0 16 16" className="state-card-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1.5 15 14H1z" />
            <path d="M8 6v4" />
            <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          <p>Couldn't reach the backend. {error}</p>
        </div>
      </div>
    );
  }

  if (!stocks) {
    return (
      <div className="dashboard">
        <h1>Compare</h1>
        <DashboardSkeleton count={4} />
      </div>
    );
  }

  function toggle(ticker) {
    setSelected(prev =>
      prev.includes(ticker)
        ? prev.filter(t => t !== ticker)
        : prev.length < MAX_SELECTED ? [...prev, ticker] : prev
    );
  }

  const chosen = stocks.filter(s => selected.includes(s.ticker));

  const rows = [
    {
      label: "Conviction Score",
      render: s => {
        const tier = tierOf(s.convictionScore);
        return (
          <div className="compare-score-cell">
            <span className="ticker-score">{s.convictionScore}<span className="ticker-score-max">/100</span></span>
            <span className={`tier-badge tier-${tier.cls}`}>{tier.label}</span>
          </div>
        );
      },
    },
    {
      label: "Signal Confidence",
      render: s => `${s.scoreConfidence || "—"}${s.scoreCoveragePct != null ? ` · ${s.scoreCoveragePct}% coverage` : ""}`,
    },
    {
      label: "Signals Active",
      render: s => `${s.activeSignals}/${s.totalSignals}`,
    },
    {
      label: "Price",
      render: s => s.quote ? `$${Number(s.quote.price).toFixed(2)}` : "—",
    },
    {
      label: "Today",
      render: s => {
        if (!s.quote) return "—";
        const up = s.quote.change >= 0;
        return <span className={up ? "position-gain-up" : "position-gain-down"}>{up ? "+" : ""}{Number(s.quote.changePercent).toFixed(2)}%</span>;
      },
    },
    {
      label: "Market Cap",
      render: s => s.profile?.marketCap > 0 ? `$${(s.profile.marketCap / 1000).toFixed(1)}B` : "—",
    },
    {
      label: "Industry",
      render: s => s.profile?.industry || "—",
    },
    {
      label: "30-Day Trend",
      render: s => <Sparkline values={s.sparkline} />,
    },
  ];

  return (
    <div className="dashboard">
      <h1>Compare</h1>
      <p className="compare-intro">Pick up to {MAX_SELECTED} tickers to compare side by side.</p>

      <div className="compare-picker">
        {stocks.map(s => (
          <button
            key={s.ticker}
            className={`compare-pill ${selected.includes(s.ticker) ? "compare-pill-active" : ""}`}
            onClick={() => toggle(s.ticker)}
          >
            {s.ticker}
          </button>
        ))}
      </div>

      {chosen.length < 2 ? (
        <div className="state-card state-card-empty">
          <svg viewBox="0 0 16 16" className="state-card-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5.2v3.3" />
            <circle cx="8" cy="10.8" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          <p>Pick at least 2 tickers above to compare.</p>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {chosen.map(s => (
                  <th key={s.ticker}>
                    <Link to={`/ticker/${s.ticker}`} className="compare-ticker-link">{s.ticker}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  {chosen.map(s => <td key={s.ticker}>{row.render(s)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
