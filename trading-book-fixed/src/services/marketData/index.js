import { createTwelveDataProvider } from './TwelveDataProvider';
import { createBinanceProvider } from './BinanceProvider';
import { createCsvProvider } from './CsvProvider';

const providers = {
  twelvedata: createTwelveDataProvider(),
  binance: createBinanceProvider(),
  csv: createCsvProvider(),
};

const aggregateYearly = (monthlyBars = []) => {
  const groups = new Map();
  monthlyBars.forEach((bar) => {
    const year = new Date(bar.time * 1000).getUTCFullYear();
    const list = groups.get(year) || [];
    list.push(bar);
    groups.set(year, list);
  });

  return Array.from(groups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, list]) => {
      const sorted = list.sort((a, b) => a.time - b.time);
      const open = sorted[0].open;
      const close = sorted[sorted.length - 1].close;
      const high = Math.max(...sorted.map((bar) => bar.high));
      const low = Math.min(...sorted.map((bar) => bar.low));
      return {
        time: sorted[0].time,
        open,
        high,
        low,
        close,
      };
    });
};

export const createMarketDataService = () => ({
  getProvider(providerId) {
    return providers[providerId] || providers.twelvedata;
  },
  async fetchCandles({ providerId, symbol, interval, limit, apiKey }) {
    const provider = providers[providerId] || providers.twelvedata;
    const result = await provider.fetchCandles({ symbol, interval, limit, apiKey });
    return result;
  },
  aggregateYearly,
});

export { providers };
