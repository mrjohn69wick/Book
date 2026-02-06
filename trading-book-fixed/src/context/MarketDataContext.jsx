import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeBars } from '../lib/ohlcv/normalizeBars';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';
import { createMarketDataService } from '../services/marketData';
import { defaultLimits, instruments, INTERVALS } from '../services/marketData/types';

const MarketDataContext = createContext(null);
const marketDataService = createMarketDataService();

export const MarketDataProvider = ({ children }) => {
  const stored = safeGetJSON(keys.marketSelection, {});
  const initialInstrument = instruments.some((item) => item.id === stored.instrumentId)
    ? stored.instrumentId
    : instruments[0].id;
  const initialTimeframe = INTERVALS[stored.timeframeId]
    ? stored.timeframeId
    : '1m';
  const storedMode = safeGetJSON(keys.marketMode, 'live');

  const [instrumentId, setInstrumentId] = useState(initialInstrument);
  const [timeframeId, setTimeframeId] = useState(initialTimeframe);
  const [mode, setMode] = useState(storedMode === 'csv' ? 'csv' : 'live');
  const [bars, setBars] = useState([]);
  const [latestBar, setLatestBar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [resolvedSymbol, setResolvedSymbol] = useState('');
  const pollerRef = useRef(null);

  const persistSelection = (nextInstrument, nextTimeframe) => {
    safeSetJSON(keys.marketSelection, {
      instrumentId: nextInstrument,
      timeframeId: nextTimeframe,
    });
  };

  const stopPolling = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  };

  const loadCandles = async ({ apiKey, limitOverride } = {}) => {
    if (mode === 'csv') return;

    setLoading(true);
    setError('');
    setErrorCode('');
    setRateLimited(false);
    setResolvedSymbol('');

    const tf = INTERVALS[timeframeId];
    if (!tf) {
      setError('الإطار الزمني غير مدعوم.');
      setLoading(false);
      return;
    }

    const selected = instruments.find((item) => item.id === instrumentId);
    const providerId = selected?.provider || 'twelvedata';
    const storedLimit = Number(safeGetJSON(keys.marketLimit, defaultLimits[timeframeId] || 1500));
    const limit = Math.max(10, Math.min(limitOverride || storedLimit || 1500, providerId === 'binance' ? 3000 : 5000));
    const interval = providerId === 'binance' ? tf.binance : tf.twelveData;

    if (providerId === 'twelvedata' && !apiKey) {
      setError('أضف مفتاح Twelve Data من صفحة الإعدادات.');
      setErrorCode('MISSING_API_KEY');
      setLoading(false);
      return;
    }

    try {
      const { bars: fetched, resolvedSymbol: apiResolvedSymbol } = await marketDataService.fetchCandles({
        providerId,
        symbol: instrumentId,
        interval,
        limit,
        apiKey,
      });
      const { bars: normalized, error: normalizeError } = normalizeBars(fetched);
      if (normalizeError || normalized.length < 2) {
        setBars([]);
        setLatestBar(null);
        setError('تعذر قراءة بيانات الشموع.');
        setErrorCode('INVALID_BARS');
        setLoading(false);
        return;
      }

      const resultBars = timeframeId === '1Y'
        ? marketDataService.aggregateYearly(normalized)
        : normalized;
      setBars(resultBars);
      setLatestBar(resultBars[resultBars.length - 1] || null);
      setLastUpdated(Date.now());
      if (apiResolvedSymbol) setResolvedSymbol(apiResolvedSymbol);

      if (mode === 'live') {
        startPolling(apiKey);
      }
    } catch (err) {
      if (err?.status === 429 || err?.message === 'RATE_LIMIT') {
        setRateLimited(true);
        setError('تم تجاوز حد الطلبات. يرجى الانتظار ثم إعادة المحاولة.');
        setErrorCode('RATE_LIMIT');
        stopPolling();
      } else {
        setError(err?.message || 'تعذر تحميل البيانات الحية.');
        setErrorCode('API_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (apiKey) => {
    if (!apiKey && !instrumentId.endsWith('USDT')) return;
    if (mode !== 'live') return;
    const tf = INTERVALS[timeframeId];
    if (!tf) return;
    const selected = instruments.find((item) => item.id === instrumentId);
    const providerId = selected?.provider || 'twelvedata';
    const interval = providerId === 'binance' ? tf.binance : tf.twelveData;

    const intervalMs = ['1m'].includes(timeframeId)
      ? 20_000
      : ['5m', '15m'].includes(timeframeId)
        ? 60_000
        : 120_000;

    stopPolling();

    pollerRef.current = setInterval(async () => {
      try {
        const { bars: fetched } = await marketDataService.fetchCandles({
          providerId,
          symbol: instrumentId,
          interval,
          limit: 2,
          apiKey,
        });
        const { bars: normalized } = normalizeBars(fetched);
        const nextBars = timeframeId === '1Y'
          ? marketDataService.aggregateYearly(normalized)
          : normalized;
        const last = nextBars[nextBars.length - 1];
        if (last) {
          setLatestBar(last);
          setLastUpdated(Date.now());
        }
      } catch (err) {
        if (err?.status === 429 || err?.message === 'RATE_LIMIT') {
          setRateLimited(true);
          stopPolling();
        }
      }
    }, intervalMs);
  };

  useEffect(() => stopPolling(), [instrumentId, timeframeId]);
  useEffect(() => () => stopPolling(), []);

  useEffect(() => {
    safeSetJSON(keys.marketMode, mode);
    if (mode !== 'live') stopPolling();
  }, [mode]);

  useEffect(() => {
    if (mode === 'csv') return;
    const apiKey = safeGetJSON(keys.twelveDataKey, '');
    loadCandles({ apiKey });
  }, [instrumentId, timeframeId, mode]);

  const value = useMemo(() => ({
    instrumentId,
    timeframeId,
    mode,
    bars,
    latestBar,
    loading,
    error,
    errorCode,
    lastUpdated,
    rateLimited,
    resolvedSymbol,
    setInstrumentId: (id) => {
      setInstrumentId(id);
      persistSelection(id, timeframeId);
    },
    setTimeframeId: (id) => {
      setTimeframeId(id);
      persistSelection(instrumentId, id);
    },
    setMode: (nextMode) => setMode(nextMode === 'csv' ? 'csv' : 'live'),
    loadCandles,
    stopPolling,
    clearError: () => setError(''),
  }), [instrumentId, timeframeId, mode, bars, latestBar, loading, error, errorCode, lastUpdated, rateLimited, resolvedSymbol]);

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) throw new Error('useMarketData must be used within MarketDataProvider');
  return context;
};
