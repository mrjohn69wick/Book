export const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.764, 1, 1.236, 1.382, -0.236, -0.382];

const styleForRatio = (ratio) => {
  if (ratio === 0 || ratio === 1) return { lineStyle: 'solid', lineWidth: 2 };
  if (Math.abs(ratio) === 0.236 || Math.abs(ratio) === 0.764) return { lineStyle: 'dashed', lineWidth: 2 };
  if (Math.abs(ratio) === 0.382 || Math.abs(ratio) === 0.618) return { lineStyle: 'dotted', lineWidth: 1 };
  return { lineStyle: 'dotted', lineWidth: 1 };
};

export const segmentUnits = (bars = [], unitSize = 48) => {
  if (!Array.isArray(bars) || bars.length === 0) return [];
  const out = [];
  for (let i = 0; i < bars.length; i += unitSize) {
    const slice = bars.slice(i, i + unitSize).filter((b) => Number.isFinite(b.high) && Number.isFinite(b.low));
    if (!slice.length) continue;
    const high = Math.max(...slice.map((b) => b.high));
    const low = Math.min(...slice.map((b) => b.low));
    out.push({
      id: `U${out.length + 1}`,
      startTime: slice[0].time,
      endTime: slice[slice.length - 1].time,
      open: slice[0].open,
      close: slice[slice.length - 1].close,
      high,
      low,
      range: high - low,
    });
  }
  return out;
};

export const computeFibLevels = (low, high, levels = DEFAULT_FIB_LEVELS) => {
  const diff = high - low;
  if (!Number.isFinite(diff) || diff <= 0) return [];
  return levels.map((ratio) => ({ ratio, price: low + diff * ratio, ...styleForRatio(ratio) }));
};

export const computeHighlights = (prevUnit, currentUnit) => {
  if (!prevUnit || !currentUnit) return [];
  const prevRange = prevUnit.range || (prevUnit.high - prevUnit.low);
  const currRange = currentUnit.range || (currentUnit.high - currentUnit.low);
  const inside = currentUnit.high <= prevUnit.high && currentUnit.low >= prevUnit.low;
  const breakHigh = currentUnit.high > prevUnit.high;
  const breakLow = currentUnit.low < prevUnit.low;
  const bothSides = breakHigh && breakLow;
  const weak123 = prevRange > 0 && (Math.abs(currentUnit.close - currentUnit.open) / prevRange) < 0.236;
  const insideShort = inside && currRange < prevRange * 0.5;
  const backInsideShort = prevRange > 0 && prevRange < currRange * 0.5 && currentUnit.high >= prevUnit.high && currentUnit.low <= prevUnit.low;

  return [
    { key: 'PrevBreakHL', enabled: breakHigh || breakLow, detail: breakHigh && breakLow ? 'both' : breakHigh ? 'high' : 'low' },
    { key: 'InsideHL', enabled: inside },
    { key: 'InsideShortHL', enabled: insideShort },
    { key: 'BothSidesBreak', enabled: bothSides },
    { key: 'Weak123', enabled: weak123 },
    { key: 'BackInsideShort', enabled: backInsideShort },
  ];
};

export const buildIndicatorModel = (bars = [], options = {}) => {
  const units = segmentUnits(bars, options.unitSize || 48);
  const lastUnit = units[units.length - 1] || null;
  const prevUnit = units.length > 1 ? units[units.length - 2] : null;
  const fib = lastUnit ? computeFibLevels(lastUnit.low, lastUnit.high, options.levels || DEFAULT_FIB_LEVELS) : [];
  const highlights = computeHighlights(prevUnit, lastUnit);
  const htfUnit = units.length > 2 ? units[units.length - 2] : lastUnit;
  const htfFib = htfUnit ? computeFibLevels(htfUnit.low, htfUnit.high, [0, 0.236, 0.382, 0.5, 0.618, 0.764, 1]) : [];
  return { units, lastUnit, prevUnit, fib, highlights, htfUnit, htfFib };
};

export const buildIndicatorBaselinePlan = (bars = [], options = {}) => {
  const model = buildIndicatorModel(bars, options);
  if (!model.lastUnit) return { model, lines: [], bands: [], markers: [], labels: [] };

  const { lastUnit } = model;
  const lines = [
    { key: `baseline-hl-high-${lastUnit.high}`, price: lastUnit.high, label: 'HL High', color: '#334155', lineStyle: 'dashed' },
    { key: `baseline-hl-low-${lastUnit.low}`, price: lastUnit.low, label: 'HL Low', color: '#334155', lineStyle: 'dashed' },
    ...model.fib.map((level) => ({
      key: `baseline-fib-${level.ratio}`,
      price: level.price,
      label: `Fib ${level.ratio}`,
      color: Math.abs(level.ratio) === 0.236 ? '#f97316' : '#60a5fa',
      lineStyle: level.lineStyle,
      lineWidth: level.lineWidth,
    })),
  ];

  const bands = [
    { key: 'baseline-band-0236-0382', from: lastUnit.low + lastUnit.range * 0.236, to: lastUnit.low + lastUnit.range * 0.382, label: 'المنطقة الذهبية', color: '#22c55e' },
    { key: 'baseline-band-1236-1382', from: lastUnit.low + lastUnit.range * 1.236, to: lastUnit.low + lastUnit.range * 1.382, label: '1.236-1.382', color: '#a855f7' },
  ];

  const labels = model.highlights.filter((h) => h.enabled).map((h) => ({ key: `hlx-${h.key}`, text: h.key }));
  const markers = [{ key: 'baseline-marker', time: lastUnit.endTime, price: lastUnit.close, text: 'BASELINE', color: '#22c55e' }];

  return { model, lines, bands, markers, labels };
};

export const buildLawDrawPlan = ({ law, bars, mapping = null, options = {} }) => {
  const baseline = buildIndicatorBaselinePlan(bars, options);
  const recipe = law?.chartRecipe || { overlays: [], inputs: [] };
  const overlays = Array.isArray(recipe.overlays) ? recipe.overlays : [];
  const inputs = Array.isArray(recipe.inputs) ? recipe.inputs : [];
  const mapEntry = mapping?.[law?.id] || null;
  const unknownMapping = mapEntry?.mode === 'UNKNOWN_MAPPING' || overlays.length === 0;

  const perLawMarkers = [{ key: `${law?.id}-label`, text: unknownMapping ? `${law?.id} UNKNOWN_MAPPING` : law?.id, color: unknownMapping ? '#a78bfa' : '#22c55e' }];
  const perLawLines = overlays.filter((o) => o?.type === 'priceLine').map((o, idx) => ({ key: `${law?.id}-line-${idx}`, fromRecipe: true }));
  const perLawBands = overlays.filter((o) => o?.type === 'zone').map((o, idx) => ({ key: `${law?.id}-band-${idx}`, fromRecipe: true }));

  return {
    lawId: law?.id,
    features: mapEntry?.features || ['baseline', unknownMapping ? 'fallback' : 'recipe'],
    unknownMapping,
    unknownReason: mapEntry?.reason || (unknownMapping ? 'No explicit mapping in source texts/indicator for this law.' : ''),
    attempts: mapEntry?.attempts || 1,
    linesCount: baseline.lines.length + perLawLines.length,
    boxesCount: baseline.bands.length + perLawBands.length,
    labelsCount: baseline.labels.length,
    markersCount: baseline.markers.length + perLawMarkers.length + (inputs.length ? 1 : 0),
    baseline,
    perLaw: { lines: perLawLines, bands: perLawBands, markers: perLawMarkers },
  };
};

export const buildMergedRenderPlan = ({ laws = [], bars = [], mapping = {}, options = {} }) => {
  const baseline = buildIndicatorBaselinePlan(bars, options);
  const unique = new Set();
  const dedupeByKey = (items = []) => items.filter((item) => {
    const key = item?.key || JSON.stringify(item);
    if (unique.has(key)) return false;
    unique.add(key);
    return true;
  });

  const perLawPlans = laws.map((law) => buildLawDrawPlan({ law, bars, mapping, options }));
  const merged = {
    baseline: {
      lines: dedupeByKey(baseline.lines),
      bands: dedupeByKey(baseline.bands),
      markers: dedupeByKey(baseline.markers),
      labels: dedupeByKey(baseline.labels),
    },
    laws: perLawPlans.map((plan) => ({
      lawId: plan.lawId,
      unknownMapping: plan.unknownMapping,
      unknownReason: plan.unknownReason,
      lines: dedupeByKey(plan.perLaw.lines),
      bands: dedupeByKey(plan.perLaw.bands),
      markers: dedupeByKey(plan.perLaw.markers),
    })),
    stats: perLawPlans,
  };

  return merged;
};
