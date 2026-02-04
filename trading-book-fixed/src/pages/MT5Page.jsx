import { useState, useEffect } from 'react';
import './MT5Page.css';

const MT5Page = () => {
  const [mt5Url, setMt5Url] = useState('https://trade.mql5.com/trade');
  const [customUrl, setCustomUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeTimedOut, setIframeTimedOut] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // Load saved URL from localStorage
    const savedUrl = localStorage.getItem('mt5-url');
    if (savedUrl) {
      setMt5Url(savedUrl);
      setCustomUrl(savedUrl);
    }

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setIframeReady(false);
      setIframeTimedOut(false);
      return;
    }

    setIframeReady(false);
    setIframeTimedOut(false);
    const timeoutId = window.setTimeout(() => {
      setIframeTimedOut(true);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [mt5Url, isOnline, iframeKey]);

  const handleUrlChange = () => {
    if (customUrl.trim()) {
      setMt5Url(customUrl.trim());
      localStorage.setItem('mt5-url', customUrl.trim());
    }
  };

  const handleReset = () => {
    const defaultUrl = 'https://trade.mql5.com/trade';
    setMt5Url(defaultUrl);
    setCustomUrl(defaultUrl);
    localStorage.setItem('mt5-url', defaultUrl);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`mt5-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && (
        <>
          <div className="mt5-header">
            <h1 className="page-title">MT5 WebTerminal</h1>
            <p className="page-subtitle">
              منصة MetaTrader 5 مباشرة داخل الكتاب - تداول وتحليل في مكان واحد
            </p>
          </div>

          <div className="mt5-controls">
            <div className="url-control">
              <label htmlFor="mt5-url">عنوان MT5 WebTerminal:</label>
              <div className="url-input-group">
                <input
                  id="mt5-url"
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://trade.mql5.com/trade"
                  className="url-input"
                />
                <button onClick={handleUrlChange} className="btn-apply">
                  تطبيق
                </button>
                <button onClick={handleReset} className="btn-reset">
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>

          <div className="mt5-info">
            <div className="info-card">
              <h3>ℹ️ معلومات مهمة</h3>
              <ul>
                <li><strong>يتطلب اتصال إنترنت:</strong> MT5 WebTerminal يعمل عبر الإنترنت فقط</li>
                <li><strong>معزول تماماً:</strong> الـ iframe معزول ولا يمكن للكتاب قراءة بياناته (أمان)</li>
                <li><strong>تسجيل الدخول:</strong> ستحتاج لحساب MT5 للتداول الفعلي</li>
                <li><strong>حساب تجريبي:</strong> يمكنك إنشاء حساب تجريبي مجاني للتدريب</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>🔧 إعدادات متقدمة</h3>
              <p>يمكنك تغيير URL لاستخدام WebTerminal من وسيط معين:</p>
              <ul>
                <li>الافتراضي: <code>https://trade.mql5.com/trade</code></li>
                <li>مثال وسيط: <code>https://webtrader.yourbroker.com</code></li>
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="mt5-container">
        {!isOnline ? (
          <div className="offline-message">
            <div className="offline-icon">📡</div>
            <h2>لا يوجد اتصال بالإنترنت</h2>
            <p>MT5 WebTerminal يتطلب اتصال إنترنت للعمل</p>
            <p className="hint">تحقق من اتصالك وحاول مرة أخرى</p>
          </div>
        ) : (
          <>
            <button 
              className="fullscreen-toggle"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
            >
              {isFullscreen ? '✕' : '⛶'}
            </button>
            {iframeTimedOut && !iframeReady ? (
              <div className="offline-message">
                <div className="offline-icon">🛡️</div>
                <h2>تعذر تضمين MT5 داخل الصفحة</h2>
                <p>قد يكون التضمين محجوباً بسياسة الأمان في المتصفح.</p>
                <div className="mt5-fallback-actions">
                  <button className="btn-apply" onClick={() => window.open(mt5Url, '_blank', 'noopener,noreferrer')}>
                    فتح MT5 في نافذة جديدة
                  </button>
                  <button className="btn-reset" onClick={handleReload}>
                    إعادة المحاولة
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={mt5Url}
                className="mt5-iframe"
                title="MT5 WebTerminal"
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => setIframeReady(true)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MT5Page;
