export const normalizeBars = (input) => {
  if (!Array.isArray(input)) {
    return { bars: [], error: 'Bars not array' };
  }

  const bars = [];
  for (const bar of input) {
    let time = bar?.time;
    if (Number.isFinite(time) && time > 1e12) {
      time = Math.floor(time / 1000);
    }

    const open = Number(bar?.open);
    const high = Number(bar?.high);
    const low = Number(bar?.low);
    const close = Number(bar?.close);

    if (![time, open, high, low, close].every(Number.isFinite)) {
      continue;
    }

    bars.push({ time, open, high, low, close });
  }

  bars.sort((a, b) => a.time - b.time);

  const deduped = [];
  for (const bar of bars) {
    const last = deduped[deduped.length - 1];
    if (last?.time === bar.time) {
      deduped[deduped.length - 1] = bar;
    } else {
      deduped.push(bar);
    }
  }

  if (deduped.length < 2) {
    return { bars: [], error: 'Not enough valid bars' };
  }

  return { bars: deduped, error: null };
};
