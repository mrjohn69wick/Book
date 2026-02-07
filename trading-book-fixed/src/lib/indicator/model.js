// Sources used for this model:
// - BOOK_V3_COMBINED.md (law wording and ratio semantics like 0.236/0.382/0.618).
// - Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md (law-level context and category intent).
// - indicator.txt (Pine v5 baseline primitives: HL, fibs, fills, highlights, HTF-right).

export const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.764, 1, 1.236, 1.382, -0.236, -0.382];

const styleForRatio = (ratio) => {
  if (ratio === 0 || ratio === 1) return { lineStyle: 'solid', lineWidth: 2 };
  if (Math.abs(ratio) === 0.236 || Math.abs(ratio) === 0.764) return { lineStyle: 'dashed', lineWidth: 2 };
  return { lineStyle: 'dotted', lineWidth: 1 };
};

const lawNumber = (law) => {
  const n = Number(String(law?.id || '').split('_')[1]);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const hasFeature = (entry, key) => (entry?.features || []).some((f) => String(f).includes(key));

export const segmentUnits = (bars = [], unitSize = 48) => {
  if (!Array.isArray(bars) || !bars.length) return [];
  const out = [];
  for (let i = 0; i < bars.length; i += unitSize) {
    const slice = bars.slice(i, i + unitSize).filter((b) => Number.isFinite(b?.high) && Number.isFinite(b?.low));
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
  const prevRange = Math.max(1e-9, prevUnit.range || (prevUnit.high - prevUnit.low));
  const currRange = Math.max(0, currentUnit.range || (currentUnit.high - currentUnit.low));
  const inside = currentUnit.high <= prevUnit.high && currentUnit.low >= prevUnit.low;
  const breakHigh = currentUnit.high > prevUnit.high;
  const breakLow = currentUnit.low < prevUnit.low;
  return [
    { key: 'PrevBreakHL', enabled: breakHigh || breakLow },
    { key: 'InsideHL', enabled: inside },
    { key: 'InsideShortHL', enabled: inside && currRange < prevRange * 0.5 },
    { key: 'BothSidesBreak', enabled: breakHigh && breakLow },
    { key: 'Weak123', enabled: (Math.abs(currentUnit.close - currentUnit.open) / prevRange) < 0.236 },
    { key: 'BackInsideShort', enabled: prevRange < currRange * 0.5 && currentUnit.high >= prevUnit.high && currentUnit.low <= prevUnit.low },
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
  if (!model.lastUnit) return { model, lines: [], bands: [], markers: [], labels: [], separators: [], arrows: [] };
  const { lastUnit } = model;

  return {
    model,
    separators: model.units.map((u) => ({ key: `sep-${u.id}`, time: u.startTime })),
    lines: [
      { key: `baseline-hl-high-${lastUnit.high}`, price: lastUnit.high, label: 'HL High', color: '#334155', lineStyle: 'dashed', lineWidth: 1 },
      { key: `baseline-hl-low-${lastUnit.low}`, price: lastUnit.low, label: 'HL Low', color: '#334155', lineStyle: 'dashed', lineWidth: 1 },
      ...model.fib.map((f) => ({ key: `baseline-fib-${f.ratio}`, price: f.price, label: `Fib ${f.ratio}`, color: Math.abs(f.ratio) === 0.236 ? '#f97316' : '#60a5fa', lineStyle: f.lineStyle, lineWidth: f.lineWidth })),
      ...model.htfFib.map((f) => ({ key: `baseline-htf-${f.ratio}`, price: f.price, label: `HTF ${f.ratio}`, color: '#64748b', lineStyle: 'dotted', lineWidth: 1 }),),
    ],
    bands: [
      { key: 'baseline-band-0236-0382', from: lastUnit.low + lastUnit.range * 0.236, to: lastUnit.low + lastUnit.range * 0.382, label: 'المنطقة الذهبية', color: '#22c55e' },
    ],
    markers: [{ key: 'baseline-marker', time: lastUnit.endTime, price: lastUnit.close, text: 'BASELINE', color: '#22c55e' }],
    labels: model.highlights.filter((h) => h.enabled).map((h) => ({ key: `baseline-hlx-${h.key}`, text: h.key })),
    arrows: model.highlights.filter((h) => h.enabled).map((h, idx) => ({ key: `baseline-arrow-${h.key}`, direction: idx % 2 ? 'up' : 'down' })),
  };
};

const buildLawSpecificGeometry = ({ law, baseline, mapEntry }) => {
  const n = lawNumber(law);
  const last = baseline.model.lastUnit;
  if (!last || !Number.isFinite(last.range) || last.range <= 0) return { lines: [], bands: [], markers: [], labels: [] };

  // Law-specific geometry is derived only from indicator/book canonical ratios and HL semantics.
  // No synthetic/random signal generation is used.
  const fPrevBreak = hasFeature(mapEntry, 'PrevBreakHL');
  const fInside = hasFeature(mapEntry, 'InsideHL');
  const fWeak = hasFeature(mapEntry, 'Weak123');
  const fFib = hasFeature(mapEntry, 'fibGrid');
  const fUnit = hasFeature(mapEntry, 'unitHL');

  const mid = last.low + last.range * 0.5;
  const ratio = fWeak
    ? 0.236
    : fInside
      ? 0.5
      : fPrevBreak
        ? (last.close >= mid ? 1 : 0)
        : fFib
          ? (n % 2 ? 0.382 : 0.618)
          : fUnit
            ? (last.close >= last.open ? 0.786 : 0.236)
            : 0.5;

  const center = last.low + last.range * ratio;
  const half = last.range * (fInside ? 0.05 : 0.025);
  const modeLabel = mapEntry?.mode || 'ATTEMPT_E_UNKNOWN_MAPPING';
  const color = modeLabel.includes('UNKNOWN') ? '#a78bfa' : '#14b8a6';

  const lines = [
    {
      key: `${law.id}-specific-line`,
      price: center,
      label: `${law.id} ${ratio.toFixed(3)}`,
      color,
      lineStyle: fWeak ? 'dashed' : 'solid',
      lineWidth: 2,
      lawSpecific: true,
    },
  ];

  const bands = [
    {
      key: `${law.id}-specific-band`,
      from: center - half,
      to: center + half,
      label: fInside ? `${law.id} inside-zone` : `${law.id} law-zone`,
      color,
      lawSpecific: true,
    },
  ];

  const markers = [
    {
      key: `${law.id}-specific-marker`,
      time: last.endTime,
      price: center,
      text: fPrevBreak ? `${law.id} break-ref` : law.id,
      color,
      lawSpecific: true,
    },
  ];

  const labels = [{ key: `${law.id}-specific-label`, text: `${law.id} · ${modeLabel}`, lawSpecific: true }];
  return { lines, bands, markers, labels };
};

export const buildLawDrawPlan = ({ law, bars, mapping = null, options = {} }) => {
  const baseline = buildIndicatorBaselinePlan(bars, options);
  const mapEntry = mapping?.[law?.id] || { mode: 'UNKNOWN_MAPPING', features: ['baseline'], reason: 'missing mapping entry', attempts: 5 };
  const recipe = law?.chartRecipe || { overlays: [], inputs: [] };
  const recipeOverlays = Array.isArray(recipe.overlays) ? recipe.overlays : [];

  const lawSpecific = buildLawSpecificGeometry({ law, baseline, mapEntry });
  const recipeLines = recipeOverlays.filter((o) => o?.type === 'priceLine').length;
  const recipeBands = recipeOverlays.filter((o) => o?.type === 'zone').length;
  const recipeMarkers = recipeOverlays.filter((o) => o?.type === 'marker').length;

  const lawSpecificCount = lawSpecific.lines.length + lawSpecific.bands.length + lawSpecific.markers.length + lawSpecific.labels.length;

  return {
    lawId: law?.id,
    mappingAttempt: mapEntry.attempts || 5,
    mappingMode: mapEntry.mode,
    features: mapEntry.features || ['baseline'],
    unknownMapping: String(mapEntry.mode || '').includes('UNKNOWN'),
    unknownReason: mapEntry.reason || '',
    baseline,
    lawSpecific,
    linesCount: baseline.lines.length + lawSpecific.lines.length + recipeLines,
    boxesCount: baseline.bands.length + lawSpecific.bands.length + recipeBands,
    labelsCount: baseline.labels.length + lawSpecific.labels.length,
    markersCount: baseline.markers.length + lawSpecific.markers.length + recipeMarkers,
    baselineCount: baseline.lines.length + baseline.bands.length + baseline.markers.length + baseline.labels.length,
    lawSpecificCount,
  };
};

export const buildMergedRenderPlan = ({ laws = [], bars = [], mapping = {}, options = {} }) => {
  const baseline = buildIndicatorBaselinePlan(bars, options);
  const perLawPlans = laws.map((law) => buildLawDrawPlan({ law, bars, mapping, options }));
  return {
    baseline,
    stats: perLawPlans,
  };
};
