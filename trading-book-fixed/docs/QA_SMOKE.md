# QA Smoke Checklist (Live Data + Charts)

## Setup
- Clear app storage (localStorage/sessionStorage).
- Open `/learn` and `/chart` in the app.

## Learn Page
- Verify progress label shows `0 / <total>` after clearing storage.
- Mark one law complete and confirm the count/percent updates.
- Confirm no NaN/Infinity appears in the progress UI.
- Save a Twelve Data key in Settings; return to Learn and confirm live load is enabled without reload.

## Chart Initialization
- Hard refresh `/chart` 10 times (no chart crashes).
- Resize the window; the chart stays responsive.
- Click "Apply on chart" for multiple laws and confirm each shows a marker/overlay.

## Live Data (with Twelve Data key)
- Open Settings → save a valid API key.
- On `/chart`, load XAU/USD at 1h (default limit) → chart renders.
- Switch timeframe to 1m and 1d → chart updates without errors.
- Toggle Live/Snapshot:
  - Snapshot: chart stays stable (no updates for 5+ minutes).
  - Live: last candle updates.

## Fallback (no key)
- Remove the key; `/chart` prompts for key or CSV.
- Upload a valid CSV and ensure the chart renders.
