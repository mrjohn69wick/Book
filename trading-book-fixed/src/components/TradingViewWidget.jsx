import { useEffect, useRef } from 'react';
import './TradingViewWidget.css';

const TradingViewWidget = ({ symbol = 'BTCUSD', height = 500, theme = 'dark' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: false,
          width: '100%',
          height: height,
          symbol: symbol,
          interval: 'D',
          timezone: 'Asia/Riyadh',
          theme: theme,
          style: '1',
          locale: 'ar_AE',
          toolbar_bg: '#1a1d2e',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          container_id: containerRef.current.id,
          studies: [],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, height, theme]);

  return (
    <div className="tradingview-widget-wrapper">
      <div 
        ref={containerRef} 
        id={`tradingview_${Math.random().toString(36).substr(2, 9)}`}
        className="tradingview-widget-container"
        style={{ height: `${height}px` }}
      />
      <div className="tradingview-attribution">
        <span>مدعوم بواسطة </span>
        <a 
          href="https://www.tradingview.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          TradingView
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget;
