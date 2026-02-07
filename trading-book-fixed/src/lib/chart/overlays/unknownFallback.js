export function applyUnknownMappingFallback({ law, data, getDataRange, addPriceLine, drawFibLines, addZoneBand, addMarker }) {
  const lawId = law?.id || 'unknown-law';
  const range = getDataRange();
  const lastBar = data[data.length - 1];
  if (!range || !lastBar) return false;

  addPriceLine(range.low, { color: '#64748b', lineStyle: 'dashed', title: `${lawId} SAFE_UNKNOWN LOW` }, lawId);
  addPriceLine(range.high, { color: '#64748b', lineStyle: 'dashed', title: `${lawId} SAFE_UNKNOWN HIGH` }, lawId);
  drawFibLines(range.low, range.high, { color: '#a78bfa', lineStyle: 'dotted', includeEquilibrium: true }, lawId);
  addZoneBand(
    range.low + (range.high - range.low) * 0.236,
    range.low + (range.high - range.low) * 0.382,
    `SAFE_UNKNOWN ${lawId}`,
    '#a78bfa',
    lawId
  );
  addMarker(lastBar.time, lastBar.close, { shape: 'square', color: '#a78bfa', text: `${lawId} SAFE_UNKNOWN` }, lawId);
  return true;
}
