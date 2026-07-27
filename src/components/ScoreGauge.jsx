const SIZE = 108;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TIER_VAR = {
  high: "var(--positive)",
  moderate: "#EAB84D",
  low: "var(--negative)",
};

// Circular progress ring around the conviction score — the visual "hero"
// element on the ticker detail page. Score/max text reuses the existing
// .score-number/.score-max classes so typography stays identical to
// before, just wrapped in a ring instead of sitting bare.
export default function ScoreGauge({ score, tier }) {
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = CIRCUMFERENCE * (1 - pct);
  const color = TIER_VAR[(tier || "").toLowerCase()] || "var(--text-tertiary)";

  return (
    <div className="score-gauge">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="score-gauge-svg" role="img" aria-label={`Conviction score ${score} out of 100`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} className="score-gauge-track" strokeWidth={STROKE} fill="none" />
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="score-gauge-fill"
        />
      </svg>
      <div className="score-gauge-center">
        <span className="score-number">{score}</span>
        <span className="score-max">/100</span>
      </div>
    </div>
  );
}
