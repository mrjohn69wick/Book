import { useEffect, useState } from 'react';
import './SimplePage.css';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';
import { fetchWithBackoff } from '../lib/marketData/providers/twelveData';

const SettingsPage = () => {
  const [theme, setTheme] = useState('dark');
  const [apiKey, setApiKey] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.body.classList.toggle('theme-light', initialTheme === 'light');
  }, []);

  useEffect(() => {
    const savedKey = safeGetJSON(keys.twelveDataKey, '');
    setApiKey(savedKey || '');
  }, []);

  const handleThemeChange = (event) => {
    const nextTheme = event.target.checked ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme-preference', nextTheme);
    document.body.classList.toggle('theme-light', nextTheme === 'light');
  };

  const handleSaveKey = async () => {
    safeSetJSON(keys.twelveDataKey, apiKey.trim());
    window.dispatchEvent(new Event('tb-storage'));
    if (!apiKey.trim()) {
      setApiStatus('يرجى إدخال المفتاح.');
      return;
    }
    try {
      await fetchWithBackoff({
        symbol: 'SPY',
        interval: '1day',
        limit: 1,
        apiKey: apiKey.trim(),
      });
      setApiStatus('المفتاح صالح.');
    } catch (error) {
      setApiStatus('تعذر التحقق من المفتاح.');
    }
  };

  return (
    <div className="simple-page">
      <h1 className="page-title">الإعدادات</h1>
      <p className="page-subtitle">خصص تجربتك في الكتاب التفاعلي</p>

      <div className="settings-card">
        <h2 className="settings-title">المظهر</h2>
        <p className="settings-description">بدّل بين الوضع الداكن والفاتح حسب تفضيلك.</p>
        <label className="settings-toggle">
          <span>الوضع الفاتح</span>
          <input type="checkbox" checked={theme === 'light'} onChange={handleThemeChange} />
        </label>
      </div>

      <div className="settings-card">
        <h2 className="settings-title">مفتاح Twelve Data</h2>
        <p className="settings-description">أضف مفتاح API لتفعيل البيانات الحية.</p>
        <input
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="أدخل المفتاح"
          className="search-input"
        />
        <div style={{ marginTop: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleSaveKey}>
            حفظ المفتاح
          </button>
          {apiStatus && (
            <span style={{ marginInlineStart: '0.5rem' }}>{apiStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
