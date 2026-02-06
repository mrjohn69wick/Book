# IndicatorPort Dev Notes

## Approach used
- Candles remain on lightweight-charts native series.
- Indicator-like geometry uses pooled primitives:
  - price lines (HL + fib levels)
  - HTML zone bands as box/fill equivalent
  - markers for anchor labels
- Overlay namespace is per-law via overlay registry.

## Mapping to `indicator.txt`
- Unit HL concept -> `applyBaselineIndicatorOverlay` draws HL bounds.
- Fib levels -> `drawFibLines` draws 0.236 / 0.382 / 0.5 / 0.618 / 0.786.
- Fill bands -> `addZoneBand` for 0.236–0.382 region.
- Object reuse -> hidden zone bands are reused from pool.

## How to validate all laws
1. Open `/#/chart`
2. Click **Validate all laws**
3. Pass criteria per law:
   - lines >= 2
   - boxes(bands) >= 1
   - labels+markers >= 1

## Adding a new law recipe
- Add/extend law in `src/data/laws.js` with `chartRecipe.overlays`.
- Supported primitive types:
  - `priceLine`
  - `zone`
  - `marker`
- If uncertain mapping, keep explicit `UNKNOWN_MAPPING` fallback behavior and add coverage note.
