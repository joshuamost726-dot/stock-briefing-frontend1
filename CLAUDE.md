# Stock Briefing Tool — Frontend

## What this is
A personal "smart money tracker" dashboard for a small set of tracked stocks (RILY, SKHY, ASTS,
LRCX, QCOM, CWBHF, TSLA, SKFG as of 2026-07-27 — tracked list is dynamic via Settings, not fixed).
Scores each stock 0-100 across 14 signals and shows them on a dashboard + per-ticker pages. No
automated email — the website is the only interface (email feature removed 2026-07-24).

## Two separate repos
- **Backend**: `stock-briefing-tool` (GitHub: `stock-briefing-backend1`) — Node/Express on
  **Render** (free tier) + Python scripts on GitHub Actions cron, Postgres on **Neon** (free tier).
  Moved off Railway entirely 2026-07-27 (confirmed, recurring Railway deploy-queue bug).
- **Frontend**: this repo — React app on Vercel, dark theme (Robinhood/Coinbase-inspired redesign,
  see `styles.css`).

## Pages
- `/` (`Dashboard.jsx`) — every tracked stock's conviction score, BUY/HOLD/SELL badge, portfolio
  value chart if positions are entered.
- `/ticker/:ticker` (`TickerDetail.jsx`) — full signal breakdown by category, price chart, news with
  Claude context, Upcoming events, Bottom Line verdict, Ask Claude, Your Position.
- `/settings` (`Settings.jsx`) — bulk position editor, tracked-stock add/remove.
- `/glossary` (`Glossary.jsx`) — plain-English term definitions; keep this in sync when a new signal
  or feature ships (it's fallen behind before — check it covers everything on the ticker page).

## Key components
- `BulletList.jsx` (added 2026-07-27) — renders an array of Claude-generated bullet strings as a
  `<ul>`, or falls back to a plain `<p>` for a single-item array. Used for signal card explanations,
  Bottom Line reasoning, and Ask Claude — **all Claude-generated text is bullet points now, not
  paragraphs** (backend flip happened the same day; see backend `CLAUDE.md` for the prompt-level
  detail).
- `PriceChart.jsx` — reusable single-series SVG line/area chart, no external charting library.

## Known gotchas
- `REACT_APP_API_URL` is baked in at **build time**, not read at runtime. Changing it in Vercel's
  dashboard requires a redeploy, and the fastest way to confirm it actually took effect is checking
  the deployed bundle's JS for the new backend hostname — a 200 status code alone doesn't prove the
  build picked up the new value (a stale cached build would also return 200).
- `package.json` JSON syntax errors have caused Vercel build failures before — validate JSON before
  committing (there's a pre-commit hook for this in both repos).
- The backend's Render free tier spins down after 15 min idle — first load after a gap can take
  30-60s. Not a frontend bug if a page seems to hang on first visit.

## Next steps
See `TASKS.md` at the project root (`~/Projects/stock-briefing-project/TASKS.md`) for the full,
current task list and session-by-session history.
