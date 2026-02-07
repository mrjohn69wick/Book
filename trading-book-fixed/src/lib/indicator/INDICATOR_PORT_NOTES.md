# Indicator Port Notes

Ported from `indicator.txt` into Lightweight Charts stack:

- **Object pooling/reuse:**
  - Added overlay registry and reusable zone-band DOM elements to avoid runaway object creation.
  - Reuses hidden band elements before creating new ones.
- **Fib primitives:**
  - Supported core ratios: `0.236 / 0.382 / 0.5 / 0.618 / 0.786`.
  - Arabic labels are attached via price-line titles.
- **Band rendering:**
  - Implemented as HTML overlay bands aligned with price coordinates.
  - Used for 0.236–0.382 zone visualization.
- **Deterministic cleanup:**
  - Law-level clear and global clear paths remove/hide overlays consistently.

Not ported 1:1 from Pine due to library constraints:
- Massive polyline/box grid combinations and bar-index future extension logic are reduced to keep pan/zoom performance stable in browser.
