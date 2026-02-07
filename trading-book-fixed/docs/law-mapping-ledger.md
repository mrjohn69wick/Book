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
- Mirror map: `src/data/law-mapping.json`

| Mode | Count |
|---|---:|
| ATTEMPT_C_CATEGORY_DERIVED | 24 |
| ATTEMPT_A_RECIPE | 8 |
| ATTEMPT_B_INDICATOR_FEATURE | 16 |

## Unknown mapping policy
- If mode contains `UNKNOWN`, conservative fallback geometry and explicit reason are mandatory.