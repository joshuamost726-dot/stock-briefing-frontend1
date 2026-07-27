import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../api";
import PriceChart from "../components/PriceChart";
import Sparkline from "../components/Sparkline";
import { DashboardSkeleton } from "../components/Skeleton";

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
      <section className="state-card state-card-empty">
        <svg viewBox="0 0 16 16" className="state-card-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 5.2v3.3" />
          <circle cx="8" cy="10.8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
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
        <h1>Dashboard</h1>
        <DashboardSkeleton />
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

                <Sparkline values={stock.sparkline} />

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
