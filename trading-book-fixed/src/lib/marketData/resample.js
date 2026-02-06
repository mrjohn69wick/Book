export const resampleToYearly = (bars) => {
  if (!Array.isArray(bars)) return [];
  const buckets = new Map();

  bars.forEach((bar) => {
    const date = new Date(bar.time * 1000);
    const year = date.getUTCFullYear();
    if (!buckets.has(year)) {
      buckets.set(year, []);
    }
    buckets.get(year).push(bar);
  });

  const yearlyBars = [];
  buckets.forEach((items, year) => {
    const sorted = items.slice().sort((a, b) => a.time - b.time);
    const open = sorted[0].open;
    const close = sorted[sorted.length - 1].close;
    const high = Math.max(...sorted.map((b) => b.high));
    const low = Math.min(...sorted.map((b) => b.low));
    const time = Math.floor(Date.UTC(year, 0, 1) / 1000);
    yearlyBars.push({ time, open, high, low, close });
  });

  yearlyBars.sort((a, b) => a.time - b.time);
  return yearlyBars;
};
