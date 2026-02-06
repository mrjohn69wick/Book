import React from 'react';
import { clearAppStorage, keys } from '../utils/storage';

class ChartErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ChartErrorBoundary]', error, info);
    const payload = {
      message: error?.message,
      stack: error?.stack,
      ts: Date.now(),
      symbol: this.props?.symbol,
      timeframe: this.props?.timeframe,
      barsCount: this.props?.barsCount,
      lastBarTime: this.props?.lastBarTime,
    };
    sessionStorage.setItem('tb:last-chart-crash', JSON.stringify(payload));
  }

  handleDisableChart = () => {
    localStorage.setItem(keys.disableChart, '1');
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const showDetails = import.meta.env.DEV;
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          تعذر عرض الشارت. يمكنك تعطيل الشارت مؤقتًا أو إعادة تحميل الصفحة.
          <div style={{ marginTop: '0.75rem' }}>
            <button type="button" onClick={this.handleDisableChart}>
              تعطيل الشارت مؤقتًا
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
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginInlineStart: '0.5rem' }}
            >
              إعادة التحميل
            </button>
          </div>
          {showDetails && (
            <details style={{ marginTop: '0.75rem', textAlign: 'start' }}>
              <summary>تفاصيل الخطأ</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error?.message}
                {'\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
