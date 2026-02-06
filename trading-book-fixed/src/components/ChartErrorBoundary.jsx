import React from 'react';
import { keys } from '../utils/storage';

class ChartErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ChartErrorBoundary]', error, info);
  }

  handleDisableChart = () => {
    localStorage.setItem(keys.disableChart, '1');
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          تعذر عرض الشارت. يمكنك تعطيل الشارت مؤقتًا أو إعادة تحميل الصفحة.
          <div style={{ marginTop: '0.75rem' }}>
            <button type="button" onClick={this.handleDisableChart}>
              تعطيل الشارت مؤقتًا
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ marginInlineStart: '0.5rem' }}
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
