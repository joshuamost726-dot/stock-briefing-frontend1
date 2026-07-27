const WIDTH = 200;
const HEIGHT = 40;
const PAD = 3;

// Minimal inline trend line for the Dashboard cards — no axes, no
// interaction, just a quick "shape" of the last ~30 trading days. Color
// follows trend direction, same convention as PriceChart.jsx.
export default function Sparkline({ values }) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xScale = (i) => PAD + (i / (values.length - 1)) * (WIDTH - PAD * 2);
  const yScale = (v) => PAD + (HEIGHT - PAD * 2) - ((v - min) / range) * (HEIGHT - PAD * 2);

  const linePath = values.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
  const trendUp = values[values.length - 1] >= values[0];
  const colorVar = trendUp ? "var(--positive)" : "var(--negative)";

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="sparkline" preserveAspectRatio="none" role="presentation">
      <path d={linePath} fill="none" stroke={colorVar} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
