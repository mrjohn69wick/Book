export function applyBaselineIndicatorOverlay({ law, data, getDataRange, addPriceLine, drawFibLines, addZoneBand, addMarker }) {
  const lawId = law?.id || 'unknown-law';
  const range = getDataRange();
  const lastBar = data[data.length - 1];
  if (!range || !lastBar) return false;

  addPriceLine(range.low, { color: '#334155', lineStyle: 'dashed', title: `${lawId} HL-Low` }, lawId);
  addPriceLine(range.high, { color: '#334155', lineStyle: 'dashed', title: `${lawId} HL-High` }, lawId);
  drawFibLines(range.low, range.high, { color: '#60a5fa', lineStyle: 'dotted', includeEquilibrium: true }, lawId);
  addZoneBand(
    range.low + (range.high - range.low) * 0.236,
    range.low + (range.high - range.low) * 0.382,
    `${lawId} baseline zone`,
    '#22c55e',
    lawId
  );
  addMarker(lastBar.time, lastBar.close, { shape: 'circle', color: '#22c55e', text: `${lawId}` }, lawId);
  return true;
}
