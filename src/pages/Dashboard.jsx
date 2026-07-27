import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../api";
import PriceChart from "../components/PriceChart";

function tierOf(score) {
  if (score >= 70) return { label: "High", action: "BUY", cls: "high" };
  if (score >= 50) return { label: "Moderate", action: "HOLD", cls: "moderate" };
  return { label: "Low", action: "SELL", cls: "low" };
}

function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    getJSON("/api/portfolio")
      .then(setPortfolio)
      .catch(() => setPortfolio(null)); // supplementary — page still works without it
  }, []);

  if (!portfolio) return null;

  if (portfolio.holdings.length === 0) {
    return (
      <section className="portfolio-summary portfolio-summary-empty">
        <p>No positions tracked yet — add a cost basis on any ticker's page to see your total portfolio value and daily change here.</p>
      </section>
    );
  }

  const dayUp = portfolio.totalDayChangeDollar >= 0;
  const gainUp = portfolio.totalGainLossDollar >= 0;

  return (
    <section className="portfolio-summary">
      <div className="portfolio-summary-stats">
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Total Value</span>
          <span className="portfolio-stat-value">
            ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Today</span>
          <span className={`portfolio-stat-value ${dayUp ? "position-gain-up" : "position-gain-down"}`}>
            {dayUp ? "+" : ""}${portfolio.totalDayChangeDollar.toFixed(2)}
            {portfolio.totalDayChangePercent != null && (
              <span className="portfolio-stat-pct"> ({dayUp ? "+" : ""}{portfolio.totalDayChangePercent.toFixed(2)}%)</span>
            )}
          </span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-label">Total Gain/Loss</span>
          <span className={`portfolio-stat-value ${gainUp ? "position-gain-up" : "position-gain-down"}`}>
            {gainUp ? "+" : ""}${portfolio.totalGainLossDollar.toFixed(2)}
            {portfolio.totalGainLossPercent != null && (
              <span className="portfolio-stat-pct"> ({gainUp ? "+" : ""}{portfolio.totalGainLossPercent.toFixed(2)}%)</span>
            )}
          </span>
        </div>
      </div>

      {portfolio.history.length > 1 && (
        <PriceChart data={portfolio.history} />
      )}
      {portfolio.historyNote && (
        <p className="portfolio-history-note">{portfolio.historyNote}</p>
      )}
    </section>
  );
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
      <PortfolioSummary />
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
                <div className="signal-count">
  {stock.activeSignals}/{stock.totalSignals} signals active
  {stock.scoreConfidence ? ` · ${stock.scoreConfidence} confidence` : ""}
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
