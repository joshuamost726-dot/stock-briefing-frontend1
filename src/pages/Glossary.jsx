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
    term: "Earnings Surprise History",
    definition:
      "Tracks whether a company has beaten or missed Wall Street's EPS estimate over its last several quarters, and by how much. A consistent track record of beats (with a positive average surprise) reads as bullish; a track record of misses reads as bearish. A mix of beats and misses — or beats dragged down by one severe miss — reads as neutral rather than being overstated in either direction. This is backward-looking, not a prediction of the next quarter's result."
  },
  {
    term: "Signal Quality / Freshness",
    definition:
      "An indicator of how recent and reliable the underlying data for a signal is. Because SEC filings and 13F data aren't updated in real time, some signals are inherently \"staler\" than others — this label tells you how much to weight a given signal based on how current its data actually is."
  },
  {
    term: "Government Contracts",
    definition:
      "Tracks recent federal contract awards to a company, scored against that company's own historical contract size (there's no market-cap-normalized benchmark available for this one). A larger-than-usual award is read as a bullish signal; this data comes from Quiver Quantitative."
  },
  {
    term: "Off-Exchange / Dark Pool Volume",
    definition:
      "Tracks the short-side share of a stock's daily trading volume that happens off public exchanges (\"dark pools\"), compared to its own rolling baseline. This tool reports the direction of the shift rather than calling it bullish or bearish outright — a spike can mean different things depending on context."
  },
  {
    term: "Technical Momentum",
    definition:
      "A price-chart-based signal using the 50-day vs. 200-day moving average trend (a \"golden cross\" — 50-day crossing above 200-day — is read as bullish; a \"death cross\" is the reverse), plus where the price sits in its 52-week range and whether volume confirms the trend. Unlike every other signal in this tool, this one doesn't depend on any country's disclosure filings, so it's the only signal that applies identically to every tracked stock."
  },
  {
    term: "Reddit / WallStreetBets Attention",
    definition:
      "Tracks spikes in how often a ticker is mentioned on Reddit's r/wallstreetbets (via ApeWisdom), as a read on retail trader attention. This only measures mention volume, not whether the sentiment is positive or negative — because of that, it's shown as its own \"Retail Sentiment\" section for context and is deliberately NOT factored into the Conviction Score."
  },
  {
    term: "Korea Ownership Change",
    definition:
      "For SK Hynix (SKHY) only. South Korea's equivalent of U.S. insider buying — executives and major shareholders disclosing ownership changes via Open DART, the Korean government's official filing system. Like insider buying, only increases in holdings count toward conviction."
  },
  {
    term: "Korea Major Shareholder",
    definition:
      "For SK Hynix (SKHY) only. South Korea's rough equivalent of a U.S. 13D/G filing — a large shareholder's stake crossing the 5% ownership threshold, disclosed via Open DART. Unlike Korea Ownership Change, this one scores both directions, since a fund cutting a 5%+ stake is as meaningful a decision as building one."
  },
  {
    term: "Korea Capital Actions",
    definition:
      "For SK Hynix (SKHY) only. South Korea's closest equivalent to U.S. buyback/stock-offering disclosures, via Open DART. Buybacks are read as unambiguously bullish; new share issuances are scored by how much they dilute existing shareholders, with a Claude-generated note on the company's stated reason for the raise."
  },
  {
    term: "Your Position",
    definition:
      "An optional per-stock entry for your own cost basis and share count, which unlocks a live gain/loss $ and % on the ticker page. It also feeds into the BUY/HOLD/SELL call: a BUY only survives if you're already in profit when the Conviction Score is 80+, or if you're averaging down at a loss when the score is 85+ (a deliberately higher bar, since catching a falling position is the riskier move)."
  },
  {
    term: "Bottom Line",
    definition:
      "A Claude-generated verdict that reads across all of a stock's active signals and explains, in plain English, whether what's showing up looks like a genuine, coordinated read from informed money — or just noise. It's a synthesis of the data already on the page, not a new data source of its own."
  },
  {
    term: "Ask Claude",
    definition:
      "A separate, deliberately unrestricted Claude commentary on a stock — given the same signals as the rest of the page but free to form its own take, including disagreeing with the tool's own Bottom Line verdict or Conviction Score. This is labeled as commentary, not a verified signal, and is never factored into the Conviction Score."
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
