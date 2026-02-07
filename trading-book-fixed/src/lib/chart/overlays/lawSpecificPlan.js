export function applyLawSpecificPlan({ law, plan, data, addPriceLine, addZoneBand, addMarker }) {
  const lawId = law?.id || 'unknown-law';
  const lastBar = data[data.length - 1];
  if (!plan) return;

  (plan.lawSpecific?.lines || []).forEach((line) => {
    addPriceLine(line.price, {
      color: line.color || '#14b8a6',
      lineStyle: line.lineStyle || 'solid',
      lineWidth: line.lineWidth || 2,
      title: line.label || `${lawId} specific`
    }, lawId);
  });

  (plan.lawSpecific?.bands || []).forEach((band) => {
    addZoneBand(band.from, band.to, band.label || `${lawId} zone`, band.color || '#14b8a6', lawId);
  });

  (plan.lawSpecific?.markers || []).forEach((marker) => {
    addMarker(marker.time || lastBar?.time, marker.price ?? lastBar?.close, {
      shape: 'square',
      color: marker.color || '#14b8a6',
      text: marker.text || lawId,
    }, lawId);
  });
}
