import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useMarketData } from '../context/MarketDataContext';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';
import { defaultLimits, instruments, intervalOptions, limitOptions } from '../services/marketData/types';

const MarketPanel = () => {
  const {
    instrumentId,
    timeframeId,
    mode,
    loading,
    error,
    rateLimited,
    lastUpdated,
    resolvedSymbol,
    setInstrumentId,
    setTimeframeId,
    setMode,
    loadCandles,
  } = useMarketData();
  const [, navigate] = useLocation();

  const [apiKey, setApiKey] = useState('');
  const defaultLimit = defaultLimits[timeframeId] || 1500;
  const [limit, setLimit] = useState('');

  useEffect(() => {
    const storedLimit = safeGetJSON(keys.marketLimit, defaultLimit);
    setLimit(String(storedLimit || defaultLimit));
  }, [timeframeId, defaultLimit]);

  useEffect(() => {
    const syncKey = () => {
      const storedKey = safeGetJSON(keys.twelveDataKey, '');
      setApiKey(storedKey || '');
    };
    syncKey();
    window.addEventListener('storage', syncKey);
    window.addEventListener('tb-storage', syncKey);
    return () => {
      window.removeEventListener('storage', syncKey);
      window.removeEventListener('tb-storage', syncKey);
    };
  }, []);

  const limitNumber = Number(limit);
  const resolvedLimit = Number.isFinite(limitNumber) && limitNumber > 0 ? limitNumber : defaultLimit;
  const lastUpdatedLabel = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('ar-SA') : null;

  return (
    <div className="chart-controls">
      <label className="chart-button">
        الأداة
        <select value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)} style={{ marginInlineStart: '0.5rem' }}>
          {instruments.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>

      <label className="chart-button">
        الإطار الزمني
        <select value={timeframeId} onChange={(event) => setTimeframeId(event.target.value)} style={{ marginInlineStart: '0.5rem' }}>
          {intervalOptions.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>

      <label className="chart-button">
        الوضع
        <select value={mode} onChange={(event) => setMode(event.target.value)} style={{ marginInlineStart: '0.5rem' }}>
          <option value="live">Live</option>
          <option value="csv">CSV</option>
        </select>
      </label>

      <label className="chart-button">
        الحد
        <select
          value={String(resolvedLimit)}
          onChange={(event) => {
            setLimit(event.target.value);
            safeSetJSON(keys.marketLimit, Number(event.target.value));
          }}
          style={{ marginInlineStart: '0.5rem' }}
        >
          {limitOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>

      <button className="chart-button" onClick={() => loadCandles({ apiKey, limitOverride: resolvedLimit })} disabled={loading || mode === 'csv'}>
        {loading ? 'جاري التحميل...' : 'تحميل البيانات'}
      </button>

      {resolvedSymbol && <span style={{ marginInlineStart: '0.5rem', color: '#60a5fa' }}>رمز فعلي: {resolvedSymbol}</span>}
      {!apiKey && mode === 'live' && !instrumentId.endsWith('USDT') && <span style={{ marginInlineStart: '0.5rem' }}>أضف مفتاح Twelve Data من الإعدادات.</span>}
      {error && <span style={{ marginInlineStart: '0.5rem', color: '#ef4444' }}>{error}</span>}
      {rateLimited && <span style={{ marginInlineStart: '0.5rem', color: '#f59e0b' }}>تم تجاوز حد الطلبات.</span>}
      {lastUpdatedLabel && <span style={{ marginInlineStart: '0.5rem', color: '#9ca3af' }}>آخر تحديث: {lastUpdatedLabel}</span>}

      {error && (
        <>
          <button className="chart-button" onClick={() => loadCandles({ apiKey, limitOverride: resolvedLimit })}>Retry</button>
          <button className="chart-button" onClick={() => setMode('csv')}>Switch to CSV</button>
          <button className="chart-button" onClick={() => navigate('/settings')}>Open Settings</button>
        </>
      )}
    </div>
  );
};

export default MarketPanel;
