import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJSON, sendJSON } from "../api";

const VALIDATION_FIELDS = [
  ["timing", "Timing"],
  ["scaleVsSalary", "Scale vs Salary"],
  ["trackRecord", "Track Record"],
  ["corroboration", "Corroboration"]
];

function PositionSection({ ticker, position, positionAdvice, onChange }) {
  const [editing, setEditing] = useState(false);
  const [costPerShare, setCostPerShare] = useState(position?.costPerShare ?? "");
  const [shares, setShares] = useState(position?.shares ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await sendJSON(`/api/stocks/${ticker}/position`, "PUT", {
        costPerShare: Number(costPerShare),
        shares: Number(shares),
      });
      setEditing(false);
      onChange();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await sendJSON(`/api/stocks/${ticker}/position`, "DELETE");
      onChange();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!position && !editing) {
    return (
      <section className="position-section">
        <h2>Your Position</h2>
        <p className="position-empty">No position tracked for {ticker} yet — signal calls aren't adjusted for chasing until you add one.</p>
        <button className="position-edit-toggle" onClick={() => setEditing(true)}>+ Add position</button>
      </section>
    );
  }

  if (editing) {
    return (
      <section className="position-section">
        <h2>Your Position</h2>
        <form className="position-form" onSubmit={handleSave}>
          <label>
            Cost per share
            <input type="number" step="0.01" min="0.01" value={costPerShare}
              onChange={e => setCostPerShare(e.target.value)} required />
          </label>
          <label>
            Shares
            <input type="number" step="0.0001" min="0.0001" value={shares}
              onChange={e => setShares(e.target.value)} required />
          </label>
          <div className="position-form-actions">
            <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
          {formError && <p className="position-error">{formError}</p>}
        </form>
      </section>
    );
  }

  const gl = positionAdvice?.gainLoss;

  return (
    <section className="position-section">
      <h2>Your Position</h2>
      <div className="position-summary">
        <span>{position.shares.toLocaleString()} shares @ ${position.costPerShare.toFixed(2)}</span>
        {gl && (
          <span className={gl.percent >= 0 ? "position-gain-up" : "position-gain-down"}>
            {gl.percent >= 0 ? "+" : ""}{gl.percent.toFixed(1)}% ({gl.dollarTotal >= 0 ? "+" : ""}${gl.dollarTotal.toFixed(2)})
          </span>
        )}
      </div>
      {positionAdvice?.explanation && (
        <p className={`position-advice ${positionAdvice.adjusted ? "position-advice-adjusted" : ""}`}>
          {positionAdvice.adjusted && <strong>Adjusted from raw {positionAdvice.rawAction} call — </strong>}
          {positionAdvice.explanation}
        </p>
      )}
      <div className="position-actions">
        <button className="position-edit-toggle" onClick={() => setEditing(true)}>Edit</button>
        <button className="position-edit-toggle" onClick={handleClear} disabled={saving}>Clear position</button>
      </div>
      {formError && <p className="position-error">{formError}</p>}
    </section>
  );
}

function InactiveSignalsRow({ signals }) {
  const [open, setOpen] = useState(false);

  if (signals.length === 0) return null;

  return (
    <div className="inactive-signals-row">
      <button className="inactive-signals-toggle" onClick={() => setOpen(!open)}>
        {open ? "Hide" : "Show"} {signals.length} signal{signals.length === 1 ? "" : "s"} with no data yet ▸
      </button>
      {open && (
        <div className="inactive-signals-list">
          {signals.map(s => (
            <div key={s.id} className="inactive-signal-line">
              <span className="inactive-signal-label">{s.label}</span>
              <span className="inactive-signal-headline">{s.headline}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="signal-card">
      {signal.source && <span className="signal-source">{signal.source}</span>}
      <div className="signal-head">
        <span className="signal-label">{signal.label}</span>
        <span className={`signal-dot dot-${signal.status}`} />
      </div>

      {signal.positionContext && (
        <div className="signal-position-badge">
          {signal.positionContext.approximate ? "~" : ""}${signal.positionContext.signalPrice.toFixed(2)}
          {" "}vs your ${signal.positionContext.userCostBasis.toFixed(2)}
          {" — "}
          {signal.positionContext.direction === "similar"
            ? "similar price"
            : `${Math.abs(signal.positionContext.pctDifference).toFixed(0)}% ${signal.positionContext.direction} your cost basis`}
        </div>
      )}

      <p className="signal-simple-explanation">{signal.simpleExplanation}</p>

      <button className="validation-toggle" onClick={() => setOpen(!open)}>
        {open ? "Hide details" : "Show details"}
      </button>

      {open && (
        <div className="signal-details">
          <p className="signal-headline">{signal.headline}</p>
          {signal.detail && <p className="signal-detail">{signal.detail}</p>}

          {signal.freshness && (
            <p className="signal-freshness">
              {signal.freshness.lastChecked
                ? `Last updated: ${new Date(signal.freshness.lastChecked).toLocaleDateString()}`
                : "Live / no stored timestamp"}
              {" · "}
              {signal.freshness.schedule}
            </p>
          )}

          <dl className="validation-list">
            {VALIDATION_FIELDS.map(([key, label]) => (
              <div key={key} className="validation-row">
                <dt>{label}</dt>
                <dd>{signal.validation[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

export default function TickerDetail() {
  const { ticker } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  function refetch() {
    return getJSON(`/api/ticker/${ticker}`)
      .then(setData)
      .catch(err => setError(err.message));
  }

  useEffect(() => {
    setData(null);
    setError(null);
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  if (error) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">← Dashboard</Link>
        <p style={{ color: "#F87171" }}>Couldn't load {ticker}. {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">← Dashboard</Link>
        <p style={{ color: "#7C8494" }}>Loading {ticker}…</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Dashboard</Link>

      <header className="detail-header">
        <div>
          <h1>{data.ticker}</h1>
          <p className="company-name">{data.companyName}</p>
        </div>
       <div className="score-block">
          <span className="score-number">{data.convictionScore}</span>
          <span className="score-max">/100</span>
          <span className={`tier-badge tier-${data.tier.toLowerCase()}`}>
            {data.tier}
          </span>
          {data.action && (
            <span className={`action-badge action-badge-${data.action.toLowerCase()}`}>
              {data.action}
            </span>
          )}
          {data.signalQuality && (
            <p className="signal-quality-note">
              {data.signalQuality.badge}
            </p>
          )}
        </div>
      </header>

      {data.quote && (
        <section className="market-data">
          <div className="market-price">
            <span className="price-value">
              ${Number(data.quote.price).toFixed(2)}
            </span>
            <span className={`price-change ${data.quote.change >= 0 ? 'up' : 'down'}`}>
              {data.quote.change >= 0 ? '+' : ''}
              {Number(data.quote.change).toFixed(2)} (
              {Number(data.quote.changePercent).toFixed(2)}%)
            </span>
          </div>

          <dl className="market-stats">
            <div>
              <dt>Market Cap</dt>
              <dd>
                {data.profile?.marketCap > 0
                  ? `$${(data.profile.marketCap / 1000).toFixed(1)}B`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Industry</dt>
              <dd>{data.profile?.industry || '—'}</dd>
            </div>
            <div>
              <dt>Day Range</dt>
              <dd>
                ${Number(data.quote.low).toFixed(2)} – $
                {Number(data.quote.high).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>P/E</dt>
              <dd>{data.profile?.pe && data.profile.pe !== 'N/A' ? data.profile.pe : '—'}</dd>
            </div>
            <div>
              <dt>Price Target</dt>
              <dd>
                {data.priceTarget?.available
                  ? `$${data.priceTarget.mean.toFixed(2)} (${data.priceTarget.upsidePct >= 0 ? '+' : ''}${data.priceTarget.upsidePct.toFixed(1)}%) · Range $${data.priceTarget.low.toFixed(0)}–$${data.priceTarget.high.toFixed(0)} · ${data.priceTarget.numAnalysts} analysts`
                  : '—'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <PositionSection
        ticker={data.ticker}
        position={data.position}
        positionAdvice={data.positionAdvice}
        onChange={refetch}
      />

      {data.upcoming && (
        <section className="upcoming">
          <h2>Upcoming</h2>
          <ul className="upcoming-list">
            {data.upcoming.earnings && (
              <li>
                <span className="upcoming-label">Earnings</span>
                <span>
                  {new Date(data.upcoming.earnings.date).toLocaleDateString()}
                  {data.upcoming.earnings.epsEstimate != null &&
                    ` (EPS est. $${Number(data.upcoming.earnings.epsEstimate).toFixed(2)})`}
                </span>
              </li>
            )}
            <li>
              <span className="upcoming-label">Next 13F sweep</span>
              <span>{new Date(data.upcoming.next13fSweep.date).toLocaleDateString()}</span>
            </li>
            {data.upcoming.nextShortInterestUpdate && (
              <li>
                <span className="upcoming-label">Next short interest update</span>
                <span>
                  ~{new Date(data.upcoming.nextShortInterestUpdate.date).toLocaleDateString()}
                  <span className="upcoming-approx"> (approximate)</span>
                </span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="plain-english">
        <h2>What this means</h2>
        <p>{data.plainEnglish}</p>
      </section>

      <section className="bottom-line">
        <h2>Bottom line: {data.bottomLine.verdict}</h2>
        <p>{data.bottomLine.reasoning}</p>
      </section>

      {data.aiTake && (
        <section className="ai-take">
          <h2>Ask Claude</h2>
          <p className="ai-take-disclaimer">AI commentary — not a verified signal, may disagree with the tool's own scoring above.</p>
          <p>{data.aiTake.text}</p>
        </section>
      )}

      {groupByCategory(data.signals).map(([category, signals]) => {
        const active = signals.filter(s => s.hasData);
        const inactive = signals.filter(s => !s.hasData);
        return (
          <section key={category} className="signal-category">
            <h2 className="signal-category-title">{category}</h2>
            {active.length > 0 && (
              <div className="signals-grid">
                {active.map(s => <SignalCard key={s.id} signal={s} />)}
              </div>
            )}
            <InactiveSignalsRow signals={inactive} />
          </section>
        );
      })}

      {data.news && data.news.length > 0 && (
        <section className="news-section">
          <h2>News</h2>
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
    </div>
  );
}

// Groups signals by category while preserving each signal's original
// SIGNAL_ORDER position (and first-seen category order) from the backend —
// no re-sorting, just partitioning a flat list into labeled sections.
function groupByCategory(signals) {
  const order = [];
  const groups = new Map();

  for (const s of signals) {
    const category = s.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
      order.push(category);
    }
    groups.get(category).push(s);
  }

  return order.map(category => [category, groups.get(category)]);
}
