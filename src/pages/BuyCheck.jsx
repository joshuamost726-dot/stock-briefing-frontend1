import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON, sendJSON } from "../api";
import BulletList from "../components/BulletList";
import ScoreGauge from "../components/ScoreGauge";
import { SkeletonBlock } from "../components/Skeleton";

function FinalAnswer({ data }) {
  const headline = data.positionAdvice?.explanation || data.bottomLine?.reasoning?.[0] || "No clear read yet.";

  return (
    <section className="final-answer-card">
      <div className="final-answer-top">
        <span className={`action-badge action-badge-${data.action.toLowerCase()} final-answer-badge`}>
          {data.action}
        </span>
        <div>
          <p className="final-answer-verdict">{data.bottomLine?.verdict}</p>
          <p className="signal-quality-note">
            {data.scoreConfidence} confidence · {data.scoreCoveragePct}% signal coverage
            {!data.isTracked && " (live snapshot only — see note below)"}
          </p>
        </div>
        <ScoreGauge score={data.convictionScore} tier={data.tier} />
      </div>
      <p className="final-answer-reasoning">{headline}</p>
    </section>
  );
}

export default function BuyCheck() {
  const [trackedTickers, setTrackedTickers] = useState([]);
  const [input, setInput] = useState("");
  const [ticker, setTicker] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [backfillConfigured, setBackfillConfigured] = useState(false);

  useEffect(() => {
    getJSON("/api/stocks").then(list => setTrackedTickers(list.map(s => s.ticker))).catch(() => {});
    getJSON("/api/backfill/status").then(s => setBackfillConfigured(s.configured)).catch(() => {});
  }, []);

  function runCheck(rawTicker) {
    const t = rawTicker.toUpperCase().trim();
    if (!t) return;
    setTicker(t);
    setInput(t);
    setData(null);
    setError(null);
    setLoading(true);
    getJSON(`/api/buy-check/${t}`)
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    runCheck(input);
  }

  async function handleTrack() {
    setTracking(true);
    try {
      await sendJSON("/api/stocks", "POST", { ticker, name: data?.companyName || "" });
      setTrackedTickers(prev => prev.includes(ticker) ? prev : [...prev, ticker]);
      runCheck(ticker);
    } catch (err) {
      setError(err.message);
    } finally {
      setTracking(false);
    }
  }

  return (
    <div className="detail-page buy-check-page">
      <h1 className="settings-title">Should I Buy?</h1>
      <p className="buy-check-intro">
        Type any ticker — one you already track, or a brand new one — for bullet-point signals,
        Claude's take, position advice, and recent news, boiled down to one clear answer.
      </p>

      <form className="buy-check-form" onSubmit={handleSubmit}>
        <input
          placeholder="Ticker (e.g. AAPL)"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoCapitalize="characters"
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Checking…" : "Check"}</button>
      </form>

      {trackedTickers.length > 0 && (
        <div className="buy-check-quickpicks">
          {trackedTickers.map(t => (
            <button key={t} className="buy-check-chip" onClick={() => runCheck(t)} type="button">
              {t}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="buy-check-skeleton">
          <SkeletonBlock width="100%" height="120px" className="skeleton-card" />
          <SkeletonBlock width="100%" height="80px" className="skeleton-margin-top skeleton-card" />
          <SkeletonBlock width="100%" height="80px" className="skeleton-margin-top skeleton-card" />
        </div>
      )}

      {error && (
        <div className="state-card state-card-error">
          <svg viewBox="0 0 16 16" className="state-card-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1.5 15 14H1z" />
            <path d="M8 6v4" />
            <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="buy-check-results">
          <header className="detail-header buy-check-header">
            <div>
              <h1>{data.ticker}</h1>
              <p className="company-name">{data.companyName}</p>
              {data.quote && (
                <p className="buy-check-price">
                  ${Number(data.quote.price).toFixed(2)}{" "}
                  <span className={data.quote.change >= 0 ? "up" : "down"}>
                    {data.quote.change >= 0 ? "+" : ""}
                    {Number(data.quote.changePercent).toFixed(2)}%
                  </span>
                </p>
              )}
            </div>
            {!data.isTracked && (
              <button className="buy-check-track-btn" onClick={handleTrack} disabled={tracking}>
                {tracking ? "Adding…" : "+ Track this stock"}
              </button>
            )}
          </header>

          {!data.isTracked && (
            <div className="not-tracked-banner">
              First look only — {data.ticker} isn't tracked yet, so this uses live price, news, analyst
              rating, and earnings history only ({data.activeSignals} of the app's signals). Tracking it
              {backfillConfigured
                ? " kicks off an immediate fetch for the rest (insider buying, congressional trading, technical momentum, etc.) — most show up within a few minutes. Institutional buying is the one exception, tied to the real quarterly SEC filing cycle, so that stays \"no data\" until the next quarter regardless."
                : " adds the other signals (insider buying, congressional trading, technical momentum, etc.) via the normal scheduled data jobs, which can take up to a day to catch up."}
            </div>
          )}

          <FinalAnswer data={data} />

          <section className="bottom-line">
            <h2>What the signals say</h2>
            <BulletList items={data.bottomLine?.reasoning} />
          </section>

          {data.position && data.positionAdvice && (
            <section className="position-section">
              <h2>Your Position</h2>
              <div className="position-summary">
                <span>{data.position.shares.toLocaleString()} shares @ ${data.position.costPerShare.toFixed(2)}</span>
                {data.positionAdvice.gainLoss && (
                  <span className={data.positionAdvice.gainLoss.percent >= 0 ? "position-gain-up" : "position-gain-down"}>
                    {data.positionAdvice.gainLoss.percent >= 0 ? "+" : ""}
                    {data.positionAdvice.gainLoss.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </section>
          )}

          {data.aiTake && (
            <section className="ai-take">
              <h2>Claude's Take</h2>
              <p className="ai-take-disclaimer">AI commentary — not a verified signal, may disagree with the scoring above.</p>
              <BulletList items={data.aiTake.bullets} />
            </section>
          )}

          {data.news && data.news.length > 0 && (
            <section className="news-section">
              <h2>Recent News</h2>
              <div className="news-list">
                {data.news.map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="news-item">
                    <p className="news-headline">{n.title}</p>
                    {n.whatItMeans && <p className="news-meaning">{n.whatItMeans}</p>}
                    <p className="news-meta">{n.source}{n.publishedAt ? ` · ${new Date(n.publishedAt).toLocaleDateString()}` : ""}</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {data.isTracked && (
            <p className="buy-check-full-link">
              <Link to={`/ticker/${data.ticker}`}>See the full signal breakdown for {data.ticker} →</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
