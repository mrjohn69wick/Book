import React from 'react';
import { clearAppStorage } from '../utils/storage';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('[ErrorBoundary]', error, info);
    sessionStorage.setItem('tb:last-crash', JSON.stringify({
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
      ts: Date.now(),
    }));
  }

  handleCopyDiagnostics = () => {
    const payload = this.buildDiagnostics();
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  };

  buildDiagnostics = () => {
    const { error, info } = this.state;
    let lastCrash = null;
    try {
      const raw = sessionStorage.getItem('tb:last-crash');
      lastCrash = raw ? JSON.parse(raw) : null;
    } catch {
      lastCrash = null;
    }

    return {
      mode: import.meta.env.MODE,
      buildSha: import.meta.env.VITE_BUILD_SHA,
      url: window.location.href,
      error: {
        message: error?.message,
        stack: error?.stack,
        componentStack: info?.componentStack,
      },
      lastCrash,
      ts: Date.now(),
    };
  };

  render() {
    if (this.state.hasError) {
      const showDetails = import.meta.env.DEV || window.location.search.includes('debug=1');
      const diagnostics = this.buildDiagnostics();
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          حدث خطأ غير متوقع. فضلاً جرّب تحديث الصفحة أو مسح بيانات التخزين.
          <div style={{ marginTop: '1rem' }}>
            <button type="button" onClick={() => window.location.reload()}>
              تحديث الصفحة
            </button>
            <button
              type="button"
              onClick={() => {
                clearAppStorage();
                window.location.reload();
              }}
              style={{ marginInlineStart: '0.5rem' }}
            >
              إعادة ضبط بيانات التطبيق
            </button>
          </div>
          {showDetails && (
            <details style={{ marginTop: '1rem', textAlign: 'start' }}>
              <summary>تفاصيل الخطأ</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
              <button type="button" onClick={this.handleCopyDiagnostics}>
                نسخ التفاصيل
              </button>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
