export const DEFAULT_FIB_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786];

export const segmentUnits = (bars = [], unitSize = 48) => {
  if (!Array.isArray(bars) || bars.length === 0) return [];
  const out = [];
  for (let i = 0; i < bars.length; i += unitSize) {
    const slice = bars.slice(i, i + unitSize);
    if (!slice.length) continue;
    const high = Math.max(...slice.map((b) => b.high));
    const low = Math.min(...slice.map((b) => b.low));
    out.push({
      startTime: slice[0].time,
      endTime: slice[slice.length - 1].time,
      open: slice[0].open,
      close: slice[slice.length - 1].close,
      high,
      low,
    });
  }
  return out;
};

export const computeFibLevels = (low, high, levels = DEFAULT_FIB_LEVELS) => {
  const diff = high - low;
  if (!Number.isFinite(diff) || diff <= 0) return [];
  return levels.map((ratio) => ({ ratio, price: low + diff * ratio }));
};

export const buildIndicatorModel = (bars = [], options = {}) => {
  const units = segmentUnits(bars, options.unitSize || 48);
  const lastUnit = units[units.length - 1] || null;
  const fib = lastUnit ? computeFibLevels(lastUnit.low, lastUnit.high, options.levels || DEFAULT_FIB_LEVELS) : [];
  return { units, lastUnit, fib };
};

export const buildLawDrawPlan = ({ law, bars, options = {} }) => {
  const model = buildIndicatorModel(bars, options);
  const overlayCount = Array.isArray(law?.chartRecipe?.overlays) ? law.chartRecipe.overlays.length : 0;
  const hasInputs = Array.isArray(law?.chartRecipe?.inputs) && law.chartRecipe.inputs.length > 0;

  const baselineLines = model.fib.length + (model.lastUnit ? 2 : 0);
  const baselineBoxes = model.lastUnit ? 1 : 0;
  const baselineMarkers = model.lastUnit ? 1 : 0;

  return {
    lawId: law?.id,
    linesCount: Math.max(overlayCount, baselineLines),
    boxesCount: baselineBoxes,
    labelsCount: model.fib.length,
    markersCount: baselineMarkers + (hasInputs ? 1 : 0),
    unknownMapping: overlayCount === 0,
  };
};
