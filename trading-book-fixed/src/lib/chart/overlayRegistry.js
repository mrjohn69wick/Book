export const createOverlayRegistry = () => {
  const state = new Map();

  const ensure = (lawId) => {
    if (!state.has(lawId)) {
      state.set(lawId, { priceLines: [], markers: [], htmlBands: [] });
    }
    return state.get(lawId);
  };

  return {
    addPriceLine(lawId, line) {
      ensure(lawId).priceLines.push(line);
    },
    addMarker(lawId, marker) {
      ensure(lawId).markers.push(marker);
    },
    addHtmlBand(lawId, band) {
      ensure(lawId).htmlBands.push(band);
    },
    getMarkers() {
      const out = [];
      state.forEach((entry) => out.push(...entry.markers));
      return out;
    },
    getStats() {
      const out = [];
      state.forEach((entry, lawId) => {
        out.push({
          lawId,
          priceLines: entry.priceLines.length,
          markers: entry.markers.length,
          bands: entry.htmlBands.filter((item) => item?.style?.display !== 'none').length,
        });
      });
      return out;
    },
    clearLaw(lawId, handlers) {
      const entry = state.get(lawId);
      if (!entry) return;
      entry.priceLines.forEach((line) => handlers.removePriceLine?.(line));
      entry.htmlBands.forEach((band) => handlers.hideBand?.(band));
      state.delete(lawId);
    },
    clearAll(handlers) {
      Array.from(state.keys()).forEach((lawId) => {
        const entry = state.get(lawId);
        if (!entry) return;
        entry.priceLines.forEach((line) => handlers.removePriceLine?.(line));
        entry.htmlBands.forEach((band) => handlers.hideBand?.(band));
        state.delete(lawId);
      });
    },
    size() {
      return state.size;
    },
    has(lawId) {
      return state.has(lawId);
    }
  };
};
