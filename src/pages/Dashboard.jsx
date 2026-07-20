import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../api";

const TICKERS = ["RILY", "SKHY", "ASTS", "LRCX", "QCOM", "CWBHF"];

function tierOf(score) {
  if (score >= 70) return { label: "High", action: "BUY", cls: "high" };
  if (score >= 50) return { label: "Moderate", action: "HOLD", cls: "moderate" };
  return { label: "Low", action: "SELL", cls: "low" };
}

export default function Dashboard() {
  const [stocks, setStocks] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJSON("/api/briefing/latest")
      .then(data => setStocks(data.stocks || []))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p style={{ color: "#F87171" }}>Couldn't reach the backend. {error}</p>
      </div>
    );
  }

  if (!stocks) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p style={{ color: "#7C8494" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="ticker-grid">
        {stocks.map(stock => {
          const tier = tierOf(stock.convictionScore);
          return (
            <Link
              key={stock.ticker}
              to={`/ticker/${stock.ticker}`}
              className="ticker-card-link"
            >
              <div className="ticker-card">
                <div className="ticker-top">
                  <span className="ticker-symbol">{stock.ticker}</span>
                  <span className={`tier-badge tier-${tier.cls}`}>
                    {tier.label}
                  </span>
                </div>

                <div className="ticker-score">
                  {stock.convictionScore}
                  <span className="ticker-score-max">/100</span>
                </div>

                <div className="gauge">
                  <div
                    className={`gauge-fill gauge-${tier.cls}`}
                    style={{ width: `${stock.convictionScore}%` }}
                  />
                </div>

                <div className={`ticker-action action-${tier.cls}`}>
                  → {tier.action}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
