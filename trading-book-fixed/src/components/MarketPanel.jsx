import { instruments } from '../lib/marketData/instruments';
import { timeframes, defaultLimits } from '../lib/marketData/timeframes';
import { useMarketData } from '../context/MarketDataContext';
import { keys, safeGetJSON } from '../utils/storage';

const MarketPanel = () => {
  const {
    instrumentId,
    timeframeId,
    loading,
    error,
    rateLimited,
    setInstrumentId,
    setTimeframeId,
    loadCandles,
  } = useMarketData();

  const apiKey = safeGetJSON(keys.twelveDataKey, '');
  const limit = defaultLimits[timeframeId] || 1500;

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
      <button
        className="chart-button"
        onClick={() => loadCandles({ apiKey, limitOverride: limit })}
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
    </div>
  );
};

export default MarketPanel;
