# LAW_DRAWING_STATUS

## Current render path
- Renderer: `src/components/LightweightChart.jsx`.
- Shared baseline: computed once via `buildMergedRenderPlan(...).baseline` and drawn as deduped HL/Fib/zone overlays.
- Per-law overlays: `buildLawDrawPlan` emits law-specific primitives (`lawSpecific`) per LAW_ID.
- State flow: `AppliedLawContext` -> `ChartPage` -> `LightweightChart`.

## Why label-only happened before
- Validation gate counted mostly aggregate geometry and did not enforce `lawSpecific>=1`.
- Multi-law baseline could be reapplied per law, causing duplication and obscuring law-specific output.

## Current guarantees
- Every law now emits law-specific geometry in addition to baseline.
- Deterministic validator fails if a law has no law-specific overlays.
- Mapping is explicit in `src/lib/indicator/law-mapping.json` and mirrored in `src/data/lawIndicatorMap.json`.

## Source references used
- `BOOK_V3_COMBINED.md`
- `Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md`
- `indicator.txt`
