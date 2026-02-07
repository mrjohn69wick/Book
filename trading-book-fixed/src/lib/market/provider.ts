import type { Bar } from './types';

export interface MarketProvider {
  id: 'binance' | 'twelvedata';
  fetchBars(params: { symbol: string; interval: string; limit: number; endTime?: number }): Promise<{ bars: Bar[]; error?: string }>;
  subscribeBars?(params: { symbol: string; interval: string; onBar: (bar: Bar) => void }): { close: () => void };
}
