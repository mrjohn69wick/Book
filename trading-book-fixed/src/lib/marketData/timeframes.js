import { intervalOptions, defaultLimits } from '../../services/marketData/types';

export const timeframes = intervalOptions.map((item) => ({
  id: item.id,
  label: item.label,
  interval: item.twelveData,
  resample: item.resample,
}));

export { defaultLimits };
