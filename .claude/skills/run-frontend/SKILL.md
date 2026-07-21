---
name: run-frontend
description: Build, run, and visually verify the stock-briefing-frontend1 React app (CRA). Use when asked to start the frontend, check that a page renders, take a screenshot of the UI, or debug a build error.
---

# Running stock-briefing-frontend1

This is a Create React App project. `node_modules` is not checked in — run
`npm install` first if it's missing.

`npm install` previously failed with `EEXIST`/`EACCES` errors from a
root-owned entry in `~/.npm/_cacache` (leftover from an old `sudo npm` run).
Fixed 2026-07-21 via `sudo chown -R "$(whoami)":staff ~/.npm`, run manually in
a real terminal (not through this session — `sudo` needs an interactive TTY
for the password, which this integration doesn't provide). Plain
`npm install`/`npx` work normally now; no scratch-cache flag needed. If it
recurs (e.g. after another `sudo npm`), the same fix applies.

## Start the dev server

```bash
cd ~/Desktop/stock-briefing-project/stock-briefing-frontend1
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill   # free the port from any stale run
BROWSER=none npm start > /tmp/cra-dev.log 2>&1 &
disown
```

Poll for readiness instead of sleeping (macOS has no `timeout` command by
default — use a manual loop):

```bash
i=0; until curl -sf http://localhost:3000 >/dev/null || [ $i -ge 60 ]; do sleep 1; i=$((i+1)); done
```

Stop it the same way: `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill`.

## Drive it / screenshot a page

No `chromium-cli` on this machine. Use `playwright-core` directly (install it
once):

```bash
npm install playwright-core
```

```javascript
// check-page.mjs
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('pageerror: ' + err.message));

await page.goto('http://localhost:3000/glossary', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/page.png', fullPage: true });
console.log('console errors:', JSON.stringify(errors, null, 2));

await browser.close();
```

Playwright's Chromium browser itself needs a one-time install too (~170MB,
cached at `~/Library/Caches/ms-playwright`):

```bash
npx --yes playwright install chromium
```

Then actually open the screenshot and look at it — a blank frame or a page
that only rendered its shell (data fetch failed) both look "successful" from
exit codes alone.

## Gotchas

- **Backend not required for static pages.** Pages like the Glossary render
  with no API calls; `Dashboard`/`TickerDetail` need the backend
  (`stock-briefing-tool`) running and reachable at `REACT_APP_API_URL`
  (defaults to `http://localhost:5000`) or they'll show a "couldn't reach
  backend" error state instead of a blank page.
- **`timeout` isn't available on macOS by default.** Use a manual poll loop
  (see above), not `timeout 30 bash -c '...'`.
