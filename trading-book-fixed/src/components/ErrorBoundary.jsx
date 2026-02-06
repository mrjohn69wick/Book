import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          حدث خطأ غير متوقع. فضلاً جرّب تحديث الصفحة أو مسح بيانات التخزين.
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
