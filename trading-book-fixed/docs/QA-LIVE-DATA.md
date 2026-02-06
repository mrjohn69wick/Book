# QA Runbook — Live Market Candles

## Prerequisites
- Obtain a Twelve Data API key.
- Open **Settings** and save the key (should show “المفتاح صالح.”).

## Smoke Tests
1. **XAU/USD 1h**
   - Select XAU/USD + 1h, click **تحميل البيانات**.
   - Verify candles render and no errors appear.
2. **EUR/USD 15m**
   - Switch instrument/timeframe, click **تحميل البيانات**.
   - Verify chart updates without crash.
3. **BTC/USD 1m (polling)**
   - Load 1m data.
   - Wait ~20s and confirm the last candle updates (no full reload).
4. **Switching**
   - Rapidly switch timeframes and instruments.
   - Ensure no blank screen or ErrorBoundary fallback.
5. **Rate Limit**
   - Click **تحميل البيانات** repeatedly to simulate 429.
   - Confirm “تم تجاوز حد الطلبات” message appears.
6. **Learn Page Stability**
   - Open `/learn` and keep for 60s.
   - Ensure it does not flash/crash.
7. **CSV Fallback**
   - Expand “خيارات متقدمة (CSV)”.
   - Cancel file picker → no crash.
   - Upload invalid CSV → error message, no crash.
   - Load sample CSV → chart renders.

## Diagnostics
- ErrorBoundary details appear with `?debug=1`.
- Check `sessionStorage.last-crash` and `sessionStorage.last-global-error`.
- Chart crash payload: `sessionStorage["tb:last-chart-crash"]`.

## Expected Outcomes
- Live data loads without throwing.
- Chart updates via incremental updates (series.update).
- No NaN/Infinity styles or console errors during normal flow.
