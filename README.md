# Stock Briefing Dashboard - Frontend

Dark-theme React frontend for the Stock Briefing tool. Connects to the backend running on Render.

## Setup

1. `npm install`
2. Set the environment variable in Vercel (or a local `.env` for dev):
   - `REACT_APP_API_URL=https://your-render-backend-url`
3. `npm start` for local dev, `npm run build` to build for deploy

This env var is baked in at **build time** — changing it in Vercel requires a redeploy, not just
saving the new value. To confirm a redeploy actually picked up a new backend URL, check the deployed
bundle's JS for the new hostname rather than trusting a 200 status alone.

The dashboard pulls every tracked stock's conviction score, signal breakdown, and (if you've entered
cost-basis positions) a portfolio summary from the backend API — no build-time data, everything is
live.

See `CLAUDE.md` for page-by-page notes and known gotchas, and `~/Projects/stock-briefing-project/TASKS.md`
for the full project history.
