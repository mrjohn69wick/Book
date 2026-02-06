import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { instruments } from '../lib/marketData/instruments';
import { timeframes, defaultLimits } from '../lib/marketData/timeframes';
import { fetchWithBackoff } from '../lib/marketData/providers/twelveData';
import { resampleToYearly } from '../lib/marketData/resample';
import { normalizeBars } from '../lib/ohlcv/normalizeBars';
import { getCachedBars, getTimeframeTtl, setCachedBars } from '../lib/marketData/cache';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';

const MarketDataContext = createContext(null);

export const MarketDataProvider = ({ children }) => {
  const stored = safeGetJSON(keys.marketSelection, {});
  const initialInstrument = instruments.some((item) => item.id === stored.instrumentId)
    ? stored.instrumentId
    : instruments[0].id;
  const initialTimeframe = timeframes.some((item) => item.id === stored.timeframeId)
    ? stored.timeframeId
    : timeframes[0].id;
  const storedMode = safeGetJSON(keys.marketMode, 'live');
  const [instrumentId, setInstrumentId] = useState(initialInstrument);
  const [timeframeId, setTimeframeId] = useState(initialTimeframe);
  const [mode, setMode] = useState(storedMode === 'snapshot' ? 'snapshot' : 'live');
  const [bars, setBars] = useState([]);
  const [latestBar, setLatestBar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
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
    setLoading(true);
    setError('');
    setRateLimited(false);

    const tf = timeframes.find((item) => item.id === timeframeId);
    if (!tf) {
      setError('الإطار الزمني غير مدعوم.');
      setLoading(false);
      return;
    }
    const storedLimit = safeGetJSON(keys.marketLimit, null);
    const storedLimitNumber = Number(storedLimit);
    const resolvedLimit = Number.isFinite(storedLimitNumber) && storedLimitNumber > 0
      ? storedLimitNumber
      : null;
    const limit = limitOverride || resolvedLimit || defaultLimits[timeframeId] || 1500;
    if (!apiKey) {
      setError('أضف مفتاح Twelve Data من صفحة الإعدادات.');
      setLoading(false);
      return;
    }

    try {
      const cacheKey = `twelvedata:${instrumentId}:${tf.interval}:${limit}`;
      const cached = await getCachedBars(cacheKey, getTimeframeTtl(timeframeId));
      if (cached?.bars?.length) {
        const { bars: normalized, error: normalizeError } = normalizeBars(cached.bars);
        if (!normalizeError && normalized.length > 1) {
          setBars(normalized);
          setLatestBar(normalized[normalized.length - 1] || null);
          setLastUpdated(cached.timestamp);
          if (mode === 'live') {
            startPolling(apiKey);
          }
          setLoading(false);
          return;
        }
      }

      const { bars: fetched } = await fetchWithBackoff({
        symbol: instrumentId,
        interval: tf.interval,
        limit: Math.min(limit, 5000),
        apiKey,
      });

      const { bars: normalized, error: normalizeError } = normalizeBars(fetched);
      if (normalizeError) {
        setBars([]);
        setLatestBar(null);
        setError('تعذر قراءة بيانات الشموع.');
        setLoading(false);
        return;
      }

      const resultBars = tf.resample === '1y' ? resampleToYearly(normalized) : normalized;
      if (resultBars.length < 2) {
        setBars([]);
        setLatestBar(null);
        setError('');
        setLoading(false);
        return;
      }

      setBars(resultBars);
      setLatestBar(resultBars[resultBars.length - 1] || null);
      setLastUpdated(Date.now());
      await setCachedBars(cacheKey, resultBars);
      if (mode === 'live') {
        startPolling(apiKey);
      }
    } catch (err) {
      if (err?.status === 429 || err?.message === 'RATE_LIMIT') {
        setRateLimited(true);
        setError('تم تجاوز حد الطلبات. يرجى الانتظار ثم إعادة المحاولة.');
        stopPolling();
      } else {
        setError('تعذر تحميل البيانات من Twelve Data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (apiKey) => {
    if (!apiKey || mode !== 'live') return;
    const tf = timeframes.find((item) => item.id === timeframeId);
    if (!tf) return;
    const intervalMs = ['1m'].includes(timeframeId)
      ? 20000
      : ['5m', '15m'].includes(timeframeId)
        ? 60000
        : 120000;

    if (pollerRef.current) {
      clearInterval(pollerRef.current);
    }

    pollerRef.current = setInterval(async () => {
      try {
        const { bars: fetched } = await fetchWithBackoff({
          symbol: instrumentId,
          interval: tf.interval,
          limit: 2,
          apiKey,
        });
        const { bars: normalized, error: normalizeError } = normalizeBars(fetched);
        if (normalizeError) {
          return;
        }
        const nextBars = tf.resample === '1y' ? resampleToYearly(normalized) : normalized;
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

  useEffect(() => {
    stopPolling();
  }, [instrumentId, timeframeId]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    safeSetJSON(keys.marketMode, mode);
    if (mode !== 'live') {
      stopPolling();
    }
  }, [mode]);

  useEffect(() => {
    const apiKey = safeGetJSON(keys.twelveDataKey, '');
    if (!apiKey) return;
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
    lastUpdated,
    rateLimited,
    setInstrumentId: (id) => {
      setInstrumentId(id);
      persistSelection(id, timeframeId);
    },
    setTimeframeId: (id) => {
      setTimeframeId(id);
      persistSelection(instrumentId, id);
    },
    setMode: (nextMode) => {
      setMode(nextMode === 'snapshot' ? 'snapshot' : 'live');
    },
    loadCandles: async (args) => {
      await loadCandles(args);
    },
    startPolling,
    stopPolling,
    clearError: () => setError(''),
  }), [instrumentId, timeframeId, mode, bars, latestBar, loading, error, lastUpdated, rateLimited]);

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
};
