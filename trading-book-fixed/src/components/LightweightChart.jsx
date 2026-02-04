import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';
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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
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

  const normalizeKey = (value) =>
    String(value ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const getField = (row, names) => {
    if (!row || typeof row !== 'object') return null;
    const normalizedMap = Object.keys(row).reduce((acc, key) => {
      acc[normalizeKey(key)] = row[key];
      return acc;
    }, {});

    for (const name of names) {
      const value = normalizedMap[normalizeKey(name)];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return null;
  };

  const parseTime = (row) => {
    const dateValue = getField(row, ['date', 'day']);
    const timeValue = getField(row, ['time', 'hour']);
    const dateTimeValue = getField(row, [
      'datetime',
      'date_time',
      'date time',
      'timestamp',
      'time stamp',
      'date_time_utc',
    ]);

    const parseEpochSeconds = (value) => {
      const numeric = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(numeric)) return null;
      const epochMs = numeric > 1e12 ? numeric : numeric * 1000;
      return Math.floor(epochMs / 1000);
    };

    if (dateTimeValue) {
      if (Number.isFinite(Number(dateTimeValue))) {
        return parseEpochSeconds(dateTimeValue);
      }
      const epochMs = Date.parse(dateTimeValue);
      return Number.isNaN(epochMs) ? null : Math.floor(epochMs / 1000);
    }

    if (Number.isFinite(Number(dateValue))) {
      return parseEpochSeconds(dateValue);
    }

    if (dateValue && timeValue) {
      const epoch = Date.parse(`${dateValue}T${timeValue}Z`);
      return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
    }

    if (dateValue) {
      const epoch = Date.parse(`${dateValue}T00:00:00Z`);
      return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
    }

    if (timeValue) {
      return parseEpochSeconds(timeValue);
    }

    return null;
  };

  const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return NaN;
    if (typeof value === 'number') return value;
    const normalized = String(value).trim();
    if (!normalized) return NaN;
    if (normalized.includes(',') && normalized.includes('.')) {
      return Number(normalized.replace(/,/g, ''));
    }
    if (normalized.includes(',') && !normalized.includes('.')) {
      return Number(normalized.replace(/,/g, '.'));
    }
    return Number(normalized);
  };

  const buildChartData = (rows) =>
    rows
      .map((row) => {
        const time = parseTime(row);
        const open = parseNumber(getField(row, ['open', 'o', 'openprice', 'open_price']));
        const high = parseNumber(getField(row, ['high', 'h', 'highprice', 'high_price']));
        const low = parseNumber(getField(row, ['low', 'l', 'lowprice', 'low_price']));
        const close = parseNumber(
          getField(row, ['close', 'c', 'closeprice', 'close_price', 'last', 'lastprice'])
        );

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
      const response = await fetch('./sample-data.csv');
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
