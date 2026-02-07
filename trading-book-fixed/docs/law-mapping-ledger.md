# Law Mapping Ledger

Sources used for every row:
- `BOOK_V3_COMBINED.md`
- `Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md`
- `indicator.txt`

## Method
A→E loop per law with deterministic feature assignment and explainable pointers.

## Summary
- Canonical map: `src/lib/indicator/law-mapping.json`
- Runtime map: `src/data/lawIndicatorMap.json`

| Mode | Count |
|---|---:|
| ATTEMPT_D_SAFE_UNKNOWN | 24 |
| ATTEMPT_A_RECIPE | 8 |
| ATTEMPT_B_INDICATOR_FEATURE | 16 |

## Unknown mapping policy
- `ATTEMPT_D_SAFE_UNKNOWN` entries are conservative and include safe fallback geometry + explicit reasons.