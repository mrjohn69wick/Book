import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { instruments } from '../lib/marketData/instruments';
import { timeframes, defaultLimits } from '../lib/marketData/timeframes';
import { fetchWithBackoff } from '../lib/marketData/providers/twelveData';
import { resampleToYearly } from '../lib/marketData/resample';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';

const MarketDataContext = createContext(null);

export const MarketDataProvider = ({ children }) => {
  const stored = safeGetJSON(keys.marketSelection, {});
  const [instrumentId, setInstrumentId] = useState(stored.instrumentId || instruments[0].id);
  const [timeframeId, setTimeframeId] = useState(stored.timeframeId || timeframes[0].id);
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

  const loadCandles = async ({ apiKey, limitOverride } = {}) => {
    setLoading(true);
    setError('');
    setRateLimited(false);

    const tf = timeframes.find((item) => item.id === timeframeId);
    const limit = limitOverride || defaultLimits[timeframeId] || 1500;
    if (!apiKey) {
      setError('أضف مفتاح Twelve Data من صفحة الإعدادات.');
      setLoading(false);
      return;
    }

    try {
      const { bars: fetched } = await fetchWithBackoff({
        symbol: instrumentId,
        interval: tf.interval,
        limit: Math.min(limit, 5000),
        apiKey,
      });

      const resultBars = tf.resample === '1y' ? resampleToYearly(fetched) : fetched;
      setBars(resultBars);
      setLatestBar(resultBars[resultBars.length - 1] || null);
      setLastUpdated(Date.now());
    } catch (err) {
      if (err?.status === 429 || err?.message === 'RATE_LIMIT') {
        setRateLimited(true);
        setError('تم تجاوز حد الطلبات. يرجى الانتظار ثم إعادة المحاولة.');
      } else {
        setError('تعذر تحميل البيانات من Twelve Data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (apiKey) => {
    if (!apiKey) return;
    const tf = timeframes.find((item) => item.id === timeframeId);
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
        const nextBars = tf.resample === '1y' ? resampleToYearly(fetched) : fetched;
        const last = nextBars[nextBars.length - 1];
        if (last) {
          setLatestBar(last);
        }
      } catch (err) {
        if (err?.status === 429 || err?.message === 'RATE_LIMIT') {
          setRateLimited(true);
        }
      }
    }, intervalMs);
  };

  useEffect(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, [instrumentId, timeframeId]);

  useEffect(() => {
    return () => {
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({
    instrumentId,
    timeframeId,
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
    loadCandles: async (args) => {
      await loadCandles(args);
      startPolling(args?.apiKey);
    },
    startPolling,
    clearError: () => setError(''),
  }), [instrumentId, timeframeId, bars, latestBar, loading, error, lastUpdated, rateLimited]);

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
