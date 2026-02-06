import { useEffect, useState } from 'react';
import { instruments } from '../lib/marketData/instruments';
import { timeframes, defaultLimits } from '../lib/marketData/timeframes';
import { useMarketData } from '../context/MarketDataContext';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';

const MarketPanel = () => {
  const {
    instrumentId,
    timeframeId,
    mode,
    loading,
    error,
    rateLimited,
    lastUpdated,
    setInstrumentId,
    setTimeframeId,
    setMode,
    loadCandles,
  } = useMarketData();

  const [apiKey, setApiKey] = useState('');
  const defaultLimit = defaultLimits[timeframeId] || 1500;
  const [limit, setLimit] = useState('');

  useEffect(() => {
    const storedLimit = safeGetJSON(keys.marketLimit, '');
    setLimit(storedLimit ? String(storedLimit) : '');
  }, [timeframeId]);

  useEffect(() => {
    const syncKey = () => {
      const storedKey = safeGetJSON(keys.twelveDataKey, '');
      setApiKey(storedKey || '');
    };
    syncKey();
    const handleStorage = (event) => {
      if (!event || event.key === keys.twelveDataKey) {
        syncKey();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('tb-storage', syncKey);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('tb-storage', syncKey);
    };
  }, []);

  const limitNumber = Number(limit);
  const resolvedLimit = Number.isFinite(limitNumber) && limitNumber > 0 ? limitNumber : defaultLimit;
  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('ar-SA')
    : null;

  return (
    <div className="chart-controls">
      <label className="chart-button">
        الأداة
        <select
          value={instrumentId}
          onChange={(event) => setInstrumentId(event.target.value)}
          style={{ marginInlineStart: '0.5rem' }}
        >
          {instruments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="chart-button">
        الإطار الزمني
        <select
          value={timeframeId}
          onChange={(event) => setTimeframeId(event.target.value)}
          style={{ marginInlineStart: '0.5rem' }}
        >
          {timeframes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="chart-button">
        الوضع
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value)}
          style={{ marginInlineStart: '0.5rem' }}
        >
          <option value="live">Live</option>
          <option value="snapshot">Snapshot</option>
        </select>
      </label>
      <label className="chart-button">
        الحد
        <input
          type="number"
          min="10"
          max="5000"
          value={limit}
          placeholder={String(defaultLimit)}
          onChange={(event) => {
            setLimit(event.target.value);
            const nextValue = event.target.value.trim();
            const nextLimit = Number.isFinite(Number(nextValue)) ? Number(nextValue) : '';
            safeSetJSON(keys.marketLimit, nextLimit);
          }}
          style={{ marginInlineStart: '0.5rem', width: '6rem' }}
        />
      </label>
      <button
        className="chart-button"
        onClick={() => loadCandles({ apiKey, limitOverride: resolvedLimit })}
        disabled={loading}
      >
        تحميل البيانات
      </button>
      {!apiKey && (
        <span style={{ marginInlineStart: '0.5rem' }}>
          أضف مفتاح Twelve Data من الإعدادات.
        </span>
      )}
      {error && (
        <span style={{ marginInlineStart: '0.5rem', color: '#ef4444' }}>
          {error}
        </span>
      )}
      {rateLimited && (
        <span style={{ marginInlineStart: '0.5rem', color: '#f59e0b' }}>
          تم تجاوز حد الطلبات.
        </span>
      )}
      {lastUpdatedLabel && (
        <span style={{ marginInlineStart: '0.5rem', color: '#9ca3af' }}>
          آخر تحديث: {lastUpdatedLabel}
        </span>
      )}
    </div>
  );
};

export default MarketPanel;
