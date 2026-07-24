import { useState, useRef } from "react";

const WIDTH = 800;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 24, left: 12 };

// Single-series line/area chart — no external chart library. Thin 2px line,
// soft area fill, hover crosshair + tooltip, sparse date labels instead of
// dense axis ticks. Color follows the series' own trend (up/down over the
// full period shown), not an arbitrary categorical hue, since there's only
// ever one series here.
export default function PriceChart({ data, valuePrefix = "$", valueFormatter, dateFormatter }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length < 2) {
    return <p className="price-chart-empty">Not enough data yet to chart.</p>;
  }

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const xScale = (i) => PADDING.left + (i / (data.length - 1)) * innerWidth;
  const yScale = (v) => PADDING.top + innerHeight - ((v - minValue) / valueRange) * innerHeight;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(2)} ${yScale(d.value).toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${xScale(data.length - 1).toFixed(2)} ${(PADDING.top + innerHeight).toFixed(2)} L ${xScale(0).toFixed(2)} ${(PADDING.top + innerHeight).toFixed(2)} Z`;

  const trendUp = data[data.length - 1].value >= data[0].value;
  const colorVar = trendUp ? "var(--positive)" : "var(--negative)";
  const gradientId = `price-chart-fill-${trendUp ? "up" : "down"}`;

  const formatValue = valueFormatter || ((v) => `${valuePrefix}${v.toFixed(2)}`);
  const formatDate = dateFormatter || ((d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }));

  function handleMouseMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const idx = Math.round(((x - PADDING.left) / innerWidth) * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div className="price-chart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="price-chart-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Chart from ${formatDate(data[0].date)} to ${formatDate(data[data.length - 1].date)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorVar} stopOpacity="0.25" />
            <stop offset="100%" stopColor={colorVar} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={colorVar} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hovered && (
          <>
            <line
              x1={xScale(hoverIndex)} x2={xScale(hoverIndex)}
              y1={PADDING.top} y2={PADDING.top + innerHeight}
              className="price-chart-crosshair"
            />
            <circle cx={xScale(hoverIndex)} cy={yScale(hovered.value)} r="4" fill={colorVar} className="price-chart-dot" />
          </>
        )}
      </svg>
      <div className="price-chart-labels">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
      {hovered && (
        <div
          className="price-chart-tooltip"
          style={{ left: `${Math.min(85, Math.max(0, (xScale(hoverIndex) / WIDTH) * 100))}%` }}
        >
          <span className="price-chart-tooltip-date">{formatDate(hovered.date)}</span>
          <span className="price-chart-tooltip-value">{formatValue(hovered.value)}</span>
        </div>
      )}
    </div>
  );
}
