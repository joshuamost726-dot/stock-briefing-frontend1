import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getJSON } from "../api";

const VALIDATION_FIELDS = [
  ["timing", "Timing"],
  ["scaleVsSalary", "Scale vs Salary"],
  ["trackRecord", "Track Record"],
  ["corroboration", "Corroboration"]
];

function SignalCard({ signal }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="signal-card">
      <div className="signal-head">
        <span className="signal-label">{signal.label}</span>
        <span className={`signal-dot dot-${signal.status}`} />
      </div>

      <p className="signal-headline">{signal.headline}</p>
      {signal.detail && <p className="signal-detail">{signal.detail}</p>}

      <button className="validation-toggle" onClick={() => setOpen(!open)}>
        {open ? "Hide validation" : "Show validation"}
      </button>

      {open && (
        <dl className="validation-list">
          {VALIDATION_FIELDS.map(([key, label]) => (
            <div key={key} className="validation-row">
              <dt>{label}</dt>
              <dd>{signal.validation[key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function TickerDetail() {
  const { ticker } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    getJSON(`/api/ticker/${ticker}`)
      .then(setData)
      .catch(err => setError(err.message));
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
        </div>
      </header>

      <section className="plain-english">
        <h2>What this means</h2>
        <p>{data.plainEnglish}</p>
      </section>

      <section className="bottom-line">
        <h2>Bottom line: {data.bottomLine.verdict}</h2>
        <p>{data.bottomLine.reasoning}</p>
      </section>

      <section className="signals-grid">
        {data.signals.map(s => <SignalCard key={s.id} signal={s} />)}
      </section>
    </div>
  );
}
