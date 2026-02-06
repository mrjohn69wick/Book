export const INTERVALS = {
  '1m': { id: '1m', label: '1m', twelveData: '1min', binance: '1m' },
  '5m': { id: '5m', label: '5m', twelveData: '5min', binance: '5m' },
  '15m': { id: '15m', label: '15m', twelveData: '15min', binance: '15m' },
  '1h': { id: '1h', label: '1h', twelveData: '1h', binance: '1h' },
  '4h': { id: '4h', label: '4h', twelveData: '4h', binance: '4h' },
  '1d': { id: '1d', label: '1d', twelveData: '1day', binance: '1d' },
  '1w': { id: '1w', label: '1w', twelveData: '1week', binance: '1w' },
  '1M': { id: '1M', label: '1M', twelveData: '1month', binance: '1M' },
  '1Y': { id: '1Y', label: '1Y', twelveData: '1month', binance: '1M', resample: '1y' },
};

export const intervalOptions = Object.values(INTERVALS);

export const defaultLimits = {
  '1m': 1500,
  '5m': 1500,
  '15m': 1500,
  '1h': 1500,
  '4h': 1500,
  '1d': 2000,
  '1w': 520,
  '1M': 240,
  '1Y': 120,
};

export const limitOptions = [300, 500, 1000, 1500, 3000, 5000];

export const instruments = [
  { id: 'XAU/USD', label: 'XAU/USD (Gold)', group: 'metals', provider: 'twelvedata' },
  { id: 'XAG/USD', label: 'XAG/USD (Silver)', group: 'metals', provider: 'twelvedata' },
  { id: 'EUR/USD', label: 'EUR/USD', group: 'forex', provider: 'twelvedata' },
  { id: 'GBP/USD', label: 'GBP/USD', group: 'forex', provider: 'twelvedata' },
  { id: 'USD/JPY', label: 'USD/JPY', group: 'forex', provider: 'twelvedata' },
  { id: 'USD/CHF', label: 'USD/CHF', group: 'forex', provider: 'twelvedata' },
  { id: 'AUD/USD', label: 'AUD/USD', group: 'forex', provider: 'twelvedata' },
  { id: 'BTCUSDT', label: 'BTCUSDT', group: 'crypto', provider: 'binance' },
  { id: 'ETHUSDT', label: 'ETHUSDT', group: 'crypto', provider: 'binance' },
  { id: 'SOLUSDT', label: 'SOLUSDT', group: 'crypto', provider: 'binance' },
  { id: 'US500', label: 'US500', group: 'indices', provider: 'twelvedata' },
  { id: 'US100', label: 'US100', group: 'indices', provider: 'twelvedata' },
  { id: 'US30', label: 'US30', group: 'indices', provider: 'twelvedata' },
  { id: 'GER40', label: 'GER40', group: 'indices', provider: 'twelvedata' },
  { id: 'UK100', label: 'UK100', group: 'indices', provider: 'twelvedata' },
];

export const MAX_OUTPUT = {
  twelvedata: 5000,
  binance: 1000,
};
