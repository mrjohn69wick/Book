const BASE_URL = 'https://data-api.binance.vision/api/v3/klines';
const MAX_LIMIT = 1000;

const intervalMsMap = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
  '4h': 14_400_000,
  '1d': 86_400_000,
  '1w': 604_800_000,
  '1M': 2_592_000_000,
};

const normalize = (rows = []) =>
  rows
    .map((row) => ({
      time: Math.floor(Number(row[0]) / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
    }))
    .filter((bar) => [bar.time, bar.open, bar.high, bar.low, bar.close].every(Number.isFinite))
    .sort((a, b) => a.time - b.time);

export const createBinanceProvider = () => ({
  id: 'binance',
  supports(symbol) {
    return symbol.endsWith('USDT');
  },
  async fetchCandles({ symbol, interval, limit }) {
    const bars = [];
    const mappedInterval = interval;
    const candleMs = intervalMsMap[mappedInterval] || 60_000;
    let remaining = limit;
    let endTime = Date.now();

    while (remaining > 0) {
      const batch = Math.min(MAX_LIMIT, remaining);
      const url = new URL(BASE_URL);
      url.searchParams.set('symbol', symbol);
      url.searchParams.set('interval', mappedInterval);
      url.searchParams.set('limit', String(batch));
      url.searchParams.set('endTime', String(endTime));

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`BINANCE_HTTP_${response.status}`);
      }
      const payload = await response.json();
      if (!Array.isArray(payload) || payload.length === 0) break;

      const normalized = normalize(payload);
      bars.unshift(...normalized);

      remaining -= normalized.length;
      const firstOpenTime = Number(payload[0][0]);
      endTime = firstOpenTime - candleMs;

      if (normalized.length < batch) break;
    }

    return { bars: bars.slice(-limit), provider: 'binance' };
  },
});
