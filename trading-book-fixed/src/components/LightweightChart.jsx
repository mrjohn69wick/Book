import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import Papa from 'papaparse';
import './LightweightChart.css';

const LightweightChart = ({ height = 500, showControls = true }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: '#1a1d2e' },
        textColor: '#b8c1ec',
      },
      grid: {
        vertLines: { color: '#2d3348' },
        horzLines: { color: '#2d3348' },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: 'ar-SA',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Load sample data by default
    loadSampleData();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  // Update chart data
  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/sample-data.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const chartData = results.data.map(row => ({
            time: row.Date,
            open: parseFloat(row.Open),
            high: parseFloat(row.High),
            low: parseFloat(row.Low),
            close: parseFloat(row.Close),
          })).filter(d => !isNaN(d.open));
          
          setData(chartData);
          setIsLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading sample data:', error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const chartData = results.data.map(row => ({
          time: row.Date || row.date || row.Time || row.time,
          open: parseFloat(row.Open || row.open),
          high: parseFloat(row.High || row.high),
          low: parseFloat(row.Low || row.low),
          close: parseFloat(row.Close || row.close),
        })).filter(d => !isNaN(d.open));
        
        setData(chartData);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error parsing file:', error);
        alert('خطأ في قراءة الملف. تأكد من أن الملف بصيغة CSV صحيحة.');
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="lightweight-chart-wrapper">
      {showControls && (
        <div className="chart-controls">
          <label className="chart-button">
            📁 تحميل CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            className="chart-button"
            onClick={loadSampleData}
            disabled={isLoading}
          >
            📊 بيانات تجريبية
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="chart-container"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default LightweightChart;
