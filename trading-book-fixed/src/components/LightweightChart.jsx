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
  const [errorMessage, setErrorMessage] = useState('');

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

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    // Load sample data by default
    loadSampleData();

    return () => {
      resizeObserver.disconnect();
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

  const parseTime = (row) => {
    const dateValue = row.Date || row.date;
    const timeValue = row.Time || row.time;

    if (dateValue && timeValue) {
      const epoch = Date.parse(`${dateValue}T${timeValue}Z`);
      return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
    }

    if (dateValue) {
      const epoch = Date.parse(`${dateValue}T00:00:00Z`);
      return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
    }

    return null;
  };

  const buildChartData = (rows) =>
    rows
      .map((row) => {
        const time = parseTime(row);
        const open = parseFloat(row.Open ?? row.open);
        const high = parseFloat(row.High ?? row.high);
        const low = parseFloat(row.Low ?? row.low);
        const close = parseFloat(row.Close ?? row.close);

        if (!time || [open, high, low, close].some((value) => Number.isNaN(value))) {
          return null;
        }

        return {
          time,
          open,
          high,
          low,
          close,
        };
      })
      .filter(Boolean);

  const loadSampleData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}sample-data.csv`);
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const chartData = buildChartData(results.data);

          if (chartData.length === 0) {
            setErrorMessage('تعذر قراءة البيانات التجريبية. يرجى التحقق من الملف.');
          }

          setData(chartData);
          setIsLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setErrorMessage('تعذر قراءة البيانات التجريبية. يرجى المحاولة لاحقاً.');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading sample data:', error);
      setErrorMessage('تعذر تحميل البيانات التجريبية. يرجى المحاولة لاحقاً.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const chartData = buildChartData(results.data);

        if (chartData.length === 0) {
          setErrorMessage('لم يتم العثور على بيانات صالحة في الملف.');
        }

        setData(chartData);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error parsing file:', error);
        setErrorMessage('خطأ في قراءة الملف. تأكد من أن الملف بصيغة CSV صحيحة.');
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

      {errorMessage && !isLoading && (
        <div className="chart-error" role="alert">
          {errorMessage}
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
