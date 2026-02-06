# Changelog

## 2026-02-06
- Added multi-law apply mode with per-law controls (activate/toggle/remove/clear-all).
- Added law overlay validation utility (`Validate all laws`) with pass/fail report.
- Added overlay registry module with deterministic per-law cleanup hooks.
- Added indicator port notes documenting pooled drawing primitives.
- Kept live provider routing: Binance for `*USDT`, Twelve Data for metals/FX/indices.
- Added per-law hidden state persistence and non-destructive show/hide behavior.
- Upgraded unknown-law fallback to draw full neutral geometry (HL + fib grid + zone band) instead of marker-only output.
- Added generated law mapping file and chart coverage report for UNKNOWN_MAPPING tracking.
