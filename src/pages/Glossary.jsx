const TERMS = [
  {
    term: "Conviction Score",
    definition:
      `A single 0-100 score for each stock that combines multiple signals — institutional buying, insider buying, short interest, and options activity — into one number. Higher means more signs that "smart money" (institutions, insiders) is accumulating the stock. It's not a prediction, it's a snapshot of what large, informed players appear to be doing right now.`
  },
  {
    term: "BUY / HOLD / SELL Call",
    definition:
      "A simplified label derived from the Conviction Score to make the dashboard scannable at a glance. Roughly: high scores lean BUY, low scores lean SELL, and everything in between is HOLD. This is a simplification of the underlying data, not a licensed recommendation — always check the individual signals behind the score before acting."
  },
  {
    term: "Institutional Buying (13F Holdings)",
    definition:
      "Large institutions (hedge funds, mutual funds, pension funds) managing over $100M are legally required to disclose their U.S. stock holdings every quarter in a filing called a 13F. This tool tracks changes in institutional ownership over time — if institutions are increasing their stake in a stock, that's read as a bullish signal."
  },
  {
    term: "Insider Buying",
    definition:
      "\"Insiders\" are a company's executives and board members. When they buy shares of their own company with their own money, it's often read as a sign of confidence — they have the best information about the company's prospects. This tool looks at executive compensation and buying patterns disclosed in SEC filings (specifically DEF 14A proxy statements) to build this signal."
  },
  {
    term: "Congressional Trading",
    definition:
      "Members of the U.S. Congress must publicly disclose their stock trades within 45 days under the STOCK Act. This tool tracks disclosed purchases as a possible \"smart money\" signal — the idea being that members of Congress sometimes have visibility into industries, regulations, or contracts before the public does. Like insider buying, only purchases are scored; sales are shown as context but not scored, since members sell for many routine reasons unrelated to conviction."
  },
  {
    term: "Short Interest",
    definition:
      "The percentage of a stock's available shares that have been sold short — meaning investors are betting the price will fall. High short interest can mean the market is skeptical of the stock, but it can also set up a \"short squeeze\" if the price rises and short-sellers are forced to buy back shares to cover their positions, pushing the price up further."
  },
  {
    term: "Options Volume",
    definition:
      "Unusual activity in the options market — large or one-sided bets using calls (betting price goes up) or puts (betting price goes down) — can signal that sophisticated traders expect a move before it happens. This tool flags when options volume is significantly higher than normal for a given stock."
  },
  {
    term: "Price Target",
    definition:
      "An analyst's projected future price for a stock, typically over a 12-month horizon. Shown alongside the Conviction Score for context, but it reflects one analyst's (or a consensus of analysts') opinion — not a guarantee."
  },
  {
    term: "Signal Quality / Freshness",
    definition:
      "An indicator of how recent and reliable the underlying data for a signal is. Because SEC filings and 13F data aren't updated in real time, some signals are inherently \"staler\" than others — this label tells you how much to weight a given signal based on how current its data actually is."
  }
];

export default function Glossary() {
  return (
    <div className="detail-page">
      <h1 className="glossary-title">Glossary</h1>
      <p className="glossary-intro">
        Plain-English definitions for every term used on this dashboard.
      </p>

      <section className="signals-grid glossary-grid">
        {TERMS.map(({ term, definition }) => (
          <div key={term} className="signal-card glossary-card">
            <h2 className="glossary-term">{term}</h2>
            <p className="signal-detail">{definition}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
