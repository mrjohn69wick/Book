# Indicator Feature Map (Port Checklist)

Reference baseline: `indicator.txt` (Pine v5) + books.

## Feature inventory mapped to web compute/renderer
1. **Separators / unit segmentation**
   - Indicator pointer: `Custom TF Separators` + unit arrays.
   - Web module: `segmentUnits` + `baseline.separators` in `src/lib/indicator/model.js`.
2. **Unit HL lines + range context**
   - Indicator pointer: pooled `linesHighPool`, `linesLowPool`.
   - Web module: `buildIndicatorBaselinePlan().lines` HL High/Low.
3. **Fib grid (0/1/0.236/0.382/0.5/0.618/0.764 + ext)**
   - Indicator pointer: `baseDefault` fib set.
   - Web module: `DEFAULT_FIB_LEVELS` + `computeFibLevels`.
4. **Fill bands**
   - Indicator pointer: `f_fillBand`, `f_fillBandForGroup` for 0.236–0.382 (and ext groups).
   - Web module: baseline golden band in `buildIndicatorBaselinePlan` and law-specific zone bands.
5. **Highlights**
   - Indicator pointer flags:
     - `enablePrevBreakHL`
     - `enablePrevInsideHL`
     - `enablePrevInsideShortHL`
     - `enablePrevWeak123HL`
     - `enablePrevBackInsideShortHL`
   - Web module: `computeHighlights`.
6. **HTF-right fib (proxy)**
   - Indicator pointer: `showAutoHTFFib`.
   - Web module: `htfUnit` + `htfFib` levels appended to baseline.
7. **Global fib grid blocks**
   - Indicator pointer: block-based fib options.
   - Current status: partially represented by baseline+law-specific bands; full block tiling remains TODO.

## Notes
- Rendering uses hybrid primitives in `LightweightChart`:
  - native price lines + markers
  - HTML zone bands for fills/boxes.
