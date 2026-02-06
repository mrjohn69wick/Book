export const timeframes = [
  { id: '1m', label: '1m', interval: '1min' },
  { id: '5m', label: '5m', interval: '5min' },
  { id: '15m', label: '15m', interval: '15min' },
  { id: '30m', label: '30m', interval: '30min' },
  { id: '1h', label: '1h', interval: '1h' },
  { id: '4h', label: '4h', interval: '4h' },
  { id: '1d', label: '1d', interval: '1day' },
  { id: '1w', label: '1w', interval: '1week' },
  { id: '1mo', label: '1mo', interval: '1month' },
  { id: '1y', label: '1y', interval: '1month', resample: '1y' },
];

export const defaultLimits = {
  '1m': 1500,
  '5m': 1500,
  '15m': 1500,
  '30m': 1500,
  '1h': 1500,
  '4h': 1500,
  '1d': 3000,
  '1w': 520,
  '1mo': 240,
  '1y': 60,
};
