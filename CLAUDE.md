# Stock Briefing Tool — Project Summary

## What this is
A personal "smart money tracker" for 6 stocks (RILY, SKHY, ASTS, LRCX, QCOM, CWBHF).
It scores each stock 0-100 based on institutional buying, insider buying (exec comp
data), and other signals, then emails the scores 3x/day and shows them on a dashboard.

## Two separate repos
- **Backend**: `stock-briefing-tool` (renamed to `stock-briefing-backend1` on GitHub) —
  Node/Express on Railway + Python scripts, deployed via GitHub Actions cron jobs.
- **Frontend**: `stock-briefing-frontend1` — React app on Vercel, dark terminal theme.

## Backend — what's built
- `convictionScore.js`, `insiderScore.js`, `shortInterestScore.js`, `optionsVolumeScore.js`
  — signal modules feeding the Conviction Score.
- `parse_def14a.py` — scrapes SEC DEF 14A filings for executive compensation
  (insider buying signal). Stores in `executive_compensation` table.
- `fetch_sec_data.py` — pulls institutional holdings (13F) + triggers exec comp parse.
  Tickers now pulled from `tracked_companies` DB table (not hardcoded).
- `stock-briefing-backend.js` — main server. Sends email briefings 8am/1pm/5pm UTC,
  serves `/api/briefing/latest` and `/api/ticker/:ticker`.
- Today's session (in Claude Code) added `priceTarget` and `signalQuality`/`freshness`
  fields to the ticker API response, plus a GitHub Actions workflow for
  `fetch_price_targets.py`.

## Frontend — what's built
- React Router set up (`/`, `/ticker/:ticker`, `/glossary`).
- `Sidebar.jsx` — dark-theme nav linking to all 6 tickers.
- `Dashboard.jsx` — 6 ticker cards, conviction score gauge bars, BUY/HOLD/SELL calls,
  fetches real data from the backend API.
- `TickerDetail.jsx` (found today) — fully built detail page: header, market data,
  plain-English summary, bottom-line verdict, signal cards with validation breakdown.
  Confirmed routed in `App.jsx` at `/ticker/:ticker`.

## Known gotchas
- Backend and frontend are two separate GitHub repos. Local folders were reorganized
  today into `~/Desktop/stock-briefing-project/` (`stock-briefing-tool` and
  `stock-briefing-frontend1` as subfolders) to reduce mix-ups.
- `package.json` JSON syntax errors caused repeated Vercel build failures earlier —
  always validate JSON before committing.

## Next steps
- Build the Glossary page.
- Backend merge conflict resolved and pushed today (commit `750f4ec`).
