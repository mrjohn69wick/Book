import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, LineStyle, createChart, createSeriesMarkers } from 'lightweight-charts';
import Papa from 'papaparse';
import './LightweightChart.css';
import { resolveRecipeValue } from '../data/parseRecipe';
import { useAppliedLaw } from '../context/AppliedLawContext';
import { normalizeBars } from '../lib/ohlcv/normalizeBars';
import { createOverlayRegistry } from '../lib/chart/overlayRegistry';
import { buildLawDrawPlan, buildMergedRenderPlan } from '../lib/indicator/model';
import lawIndicatorMap from '../data/lawIndicatorMap.json';

const LightweightChart = ({
  height = 500,
  showControls = true,
  advancedControls = false,
  showEquilibrium = false,
  showKeyLevels = false,
  showZones = false,
  appliedLaw = null,
  appliedLaws = [],
  onOverlayStatsChange,
  externalBars = null,
  latestBar = null
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const equilibriumLineRef = useRef(null);
  const keyLevelLinesRef = useRef([]);
  const zoneLinesRef = useRef([]);
  const overlaysRef = useRef({ priceLines: [], markers: [] });
  const tutorialMarkersRef = useRef({});
  const clickHandlerRef = useRef(null);
  const markersRef = useRef(null);
  const zoneLayerRef = useRef(null);
  const overlayRegistryRef = useRef({ priceLines: [], markers: [], zoneBands: [] });
  const lawOverlayRegistry = useRef(createOverlayRegistry());
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dataRef = useRef(data);
  const lastStatsSignatureRef = useRef('');
  const dedupeSignatureRef = useRef(new Set());
  const {
    tutorialActive,
    tutorialLawId,
    tutorialStepIndex,
    tutorialInputs,
    markStepCompleted,
    setTutorialInput,
    startTutorial,
    endTutorial,
    setTutorialError,
    clearTutorialError
  } = useAppliedLaw();

  const clearOverlays = () => {
    if (!candlestickSeriesRef.current) {
      overlaysRef.current = { priceLines: [], markers: [] };
      tutorialMarkersRef.current = {};
      return;
    }

    overlaysRef.current.priceLines.forEach((line) => {
      candlestickSeriesRef.current.removePriceLine(line);
    });

    overlaysRef.current.priceLines = [];
    overlaysRef.current.markers = [];
    dedupeSignatureRef.current = new Set();
    overlayRegistryRef.current.priceLines = [];
    overlayRegistryRef.current.markers = [];
    tutorialMarkersRef.current = {};
    if (zoneLayerRef.current && overlayRegistryRef.current.zoneBands.length) {
      overlayRegistryRef.current.zoneBands.forEach((band) => {
        band.style.display = 'none';
      });
    }
    if (markersRef.current) {
      markersRef.current.setMarkers([]);
    }
    lawOverlayRegistry.current.clearAll({
      removePriceLine: (line) => candlestickSeriesRef.current?.removePriceLine(line),
      hideBand: (band) => {
        band.style.display = 'none';
      }
    });
  };

  const ensureZoneLayer = () => {
    if (!chartContainerRef.current) return null;
    if (!zoneLayerRef.current) {
      const layer = document.createElement('div');
      layer.style.position = 'absolute';
      layer.style.inset = '0';
      layer.style.pointerEvents = 'none';
      layer.style.zIndex = '2';
      chartContainerRef.current.appendChild(layer);
      zoneLayerRef.current = layer;
    }
    return zoneLayerRef.current;
  };

  const addZoneBand = (fromPrice, toPrice, label = '', color = '#facc15', lawId = 'global') => {
    if (!candlestickSeriesRef.current) return;
    const layer = ensureZoneLayer();
    if (!layer) return;
    const fromY = candlestickSeriesRef.current.priceToCoordinate(fromPrice);
    const toY = candlestickSeriesRef.current.priceToCoordinate(toPrice);
    if (!Number.isFinite(fromY) || !Number.isFinite(toY)) return;

    const signature = `band:${lawId}:${fromPrice.toFixed(6)}:${toPrice.toFixed(6)}:${label}:${color}`;
    if (dedupeSignatureRef.current.has(signature)) return;
    dedupeSignatureRef.current.add(signature);

    const band = overlayRegistryRef.current.zoneBands.find((item) => item.style.display === 'none') || document.createElement('div');
    const top = Math.min(fromY, toY);
    const heightPx = Math.max(2, Math.abs(toY - fromY));
    band.style.position = 'absolute';
    band.style.left = '0';
    band.style.right = '0';
    band.style.top = `${top}px`;
    band.style.height = `${heightPx}px`;
    band.style.background = `${color}22`;
    band.style.borderTop = `1px dashed ${color}`;
    band.style.borderBottom = `1px dashed ${color}`;

    if (label) {
      const tag = document.createElement('span');
      tag.textContent = label;
      tag.style.position = 'absolute';
      tag.style.right = '4px';
      tag.style.top = '0';
      tag.style.fontSize = '11px';
      tag.style.color = color;
      tag.style.background = '#0f172aaa';
      tag.style.padding = '1px 4px';
      tag.style.borderRadius = '4px';
      band.appendChild(tag);
    }

    if (!band.parentNode) {
      layer.appendChild(band);
      overlayRegistryRef.current.zoneBands.push(band);
    }
    band.style.display = 'block';
    lawOverlayRegistry.current.addHtmlBand(lawId, band);
  };

  const addPriceLine = (price, options = {}, lawId = 'global') => {
    if (!candlestickSeriesRef.current || !Number.isFinite(price)) {
      return null;
    }

    const {
      color = '#ffffff',
      lineStyle = LineStyle.Solid,
      lineWidth = 1,
      title = '',
      axisLabelVisible = true
    } = options;

    const resolvedLineStyle = typeof lineStyle === 'string'
      ? ({
        dashed: LineStyle.Dashed,
        dotted: LineStyle.Dotted
      }[lineStyle] || LineStyle.Solid)
      : lineStyle;

    const signature = `line:${Number(price).toFixed(6)}:${color}:${resolvedLineStyle}:${lineWidth}:${title}`;
    if (dedupeSignatureRef.current.has(signature)) return null;
    dedupeSignatureRef.current.add(signature);

    const line = candlestickSeriesRef.current.createPriceLine({
      price,
      color,
      lineWidth,
      lineStyle: resolvedLineStyle,
      axisLabelVisible,
      title
    });

    overlaysRef.current.priceLines.push(line);
    overlayRegistryRef.current.priceLines.push(line);
    lawOverlayRegistry.current.addPriceLine(lawId, line);
    return line;
  };

  const addMarker = (time, price, options = {}, lawId = 'global') => {
    if (!candlestickSeriesRef.current || time == null) {
      return null;
    }

    const {
      position = 'aboveBar',
      shape = 'circle',
      color = '#ffffff',
      text = '',
      size = 1
    } = options;

    const resolvedText = text || (Number.isFinite(price) ? price.toFixed(2) : '');
    const signature = `marker:${lawId}:${time}:${Number(price).toFixed(6)}:${options.shape || 'circle'}:${options.text || ''}`;
    if (dedupeSignatureRef.current.has(signature)) return null;
    dedupeSignatureRef.current.add(signature);

    const marker = {
      time,
      position,
      shape,
      color,
      size,
      text: resolvedText
    };

    overlaysRef.current.markers.push(marker);
    overlayRegistryRef.current.markers.push(marker);
    lawOverlayRegistry.current.addMarker(lawId, marker);
    if (markersRef.current) {
      markersRef.current.setMarkers(overlaysRef.current.markers);
    }
    return marker;
  };

  const setMarkerForStep = (stepIndex, marker) => {
    const existing = tutorialMarkersRef.current[stepIndex];

    if (existing) {
      overlaysRef.current.markers = overlaysRef.current.markers.filter(
        (item) => item !== existing
      );
    }

    if (marker) {
      overlaysRef.current.markers.push(marker);
      tutorialMarkersRef.current[stepIndex] = marker;
    } else {
      delete tutorialMarkersRef.current[stepIndex];
    }

    if (markersRef.current) {
      markersRef.current.setMarkers(overlaysRef.current.markers);
    }
  };

  const getMarkerStyleForInput = (inputName) => {
    if (!inputName) {
      return { shape: 'circle', color: '#f59e0b', position: 'aboveBar' };
    }

    if (inputName.includes('entry')) {
      return { shape: 'arrowUp', color: '#22c55e', position: 'belowBar' };
    }

    if (inputName.includes('stop')) {
      return { shape: 'arrowDown', color: '#ef4444', position: 'aboveBar' };
    }

    return { shape: 'circle', color: '#60a5fa', position: 'aboveBar' };
  };

  const drawFibLines = (low, high, options = {}, lawId = 'global') => {
    if (!Number.isFinite(low) || !Number.isFinite(high) || low === high) {
      return;
    }

    const {
      color = '#60a5fa',
      lineStyle = 'dotted',
      lineWidth = 1,
      includeEquilibrium = true
    } = options;

    const ratios = includeEquilibrium
      ? [0.236, 0.382, 0.5, 0.618, 0.786]
      : [0.382, 0.5, 0.618, 0.786];
    const range = high - low;

    const arabicTitles = {
      0.236: 'حد الأمان',
      0.382: 'المنطقة الذهبية',
      0.5: 'الاتزان',
      0.618: 'حد الأمان الأعلى',
      0.786: 'امتداد',
    };

    ratios.forEach((ratio) => {
      const price = low + range * ratio;
      const isEquilibrium = ratio === 0.236;
      const title = `${ratio.toFixed(3)} ${arabicTitles[ratio] || ''}`.trim();

      addPriceLine(price, {
        color: isEquilibrium ? '#f97316' : color,
        lineStyle: isEquilibrium ? LineStyle.Dashed : lineStyle,
        lineWidth: isEquilibrium ? 2 : lineWidth,
        title,
        axisLabelVisible: true
      }, lawId);
    });

    const bandLow = low + range * 0.236;
    const bandHigh = low + range * 0.382;
    addZoneBand(bandLow, bandHigh, 'منطقة 0.236 - 0.382', '#38bdf8', lawId);
  };

  const applyUnknownMappingFallback = (law) => {
    const lawId = law?.id || 'unknown-law';
    const range = getDataRange();
    const lastBar = data[data.length - 1];
    if (!range || !lastBar) return false;

    // UNKNOWN_MAPPING fallback: TODO(BOOK_V3_COMBINED.md / Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md): add precise mapping when documented.
    addPriceLine(range.low, { color: '#64748b', lineStyle: 'dashed', title: `${lawId} LOW` }, lawId);
    addPriceLine(range.high, { color: '#64748b', lineStyle: 'dashed', title: `${lawId} HIGH` }, lawId);
    drawFibLines(range.low, range.high, { color: '#a78bfa', lineStyle: 'dotted', includeEquilibrium: true }, lawId);
    addZoneBand(range.low + (range.high - range.low) * 0.236, range.low + (range.high - range.low) * 0.382, `UNKNOWN_MAPPING ${lawId}`, '#a78bfa', lawId);
    addMarker(lastBar.time, lastBar.close, { shape: 'square', color: '#a78bfa', text: `${lawId} UNKNOWN_MAPPING` }, lawId);
    return true;
  };

  const applyBaselineIndicatorOverlay = (law) => {
    const lawId = law?.id || 'unknown-law';
    const range = getDataRange();
    const lastBar = data[data.length - 1];
    if (!range || !lastBar) return false;

    addPriceLine(range.low, { color: '#334155', lineStyle: 'dashed', title: `${lawId} HL-Low` }, lawId);
    addPriceLine(range.high, { color: '#334155', lineStyle: 'dashed', title: `${lawId} HL-High` }, lawId);
    drawFibLines(range.low, range.high, { color: '#60a5fa', lineStyle: 'dotted', includeEquilibrium: true }, lawId);
    addZoneBand(range.low + (range.high - range.low) * 0.236, range.low + (range.high - range.low) * 0.382, `${lawId} baseline zone`, '#22c55e', lawId);
    addMarker(lastBar.time, lastBar.close, { shape: 'circle', color: '#22c55e', text: `${lawId}` }, lawId);
    return true;
  };

  const applyLawSpecificPlan = (law, plan) => {
    const lawId = law?.id || 'unknown-law';
    const lastBar = data[data.length - 1];
    if (!plan) return;

    (plan.lawSpecific?.lines || []).forEach((line) => {
      addPriceLine(line.price, {
        color: line.color || '#14b8a6',
        lineStyle: line.lineStyle || 'solid',
        lineWidth: line.lineWidth || 2,
        title: line.label || `${lawId} specific`
      }, lawId);
    });

    (plan.lawSpecific?.bands || []).forEach((band) => {
      addZoneBand(band.from, band.to, band.label || `${lawId} zone`, band.color || '#14b8a6', lawId);
    });

    (plan.lawSpecific?.markers || []).forEach((marker) => {
      addMarker(marker.time || lastBar?.time, marker.price ?? lastBar?.close, {
        shape: 'square',
        color: marker.color || '#14b8a6',
        text: marker.text || lawId,
      }, lawId);
    });
  };

  const getDataRange = () => {
    if (!data.length) {
      return null;
    }

    const lows = data.map((bar) => bar.low ?? bar.value ?? bar.close);
    const highs = data.map((bar) => bar.high ?? bar.value ?? bar.close);
    return {
      low: Math.min(...lows),
      high: Math.max(...highs)
    };
  };

  const hasValidBars = (bars) => Array.isArray(bars) && bars.length > 1;

  const computeMinMax = (bars) => {
    let min = Infinity;
    let max = -Infinity;

    bars.forEach((bar) => {
      if (!Number.isFinite(bar.low) || !Number.isFinite(bar.high)) {
        return;
      }
      if (bar.low < min) min = bar.low;
      if (bar.high > max) max = bar.high;
    });

    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
      return null;
    }

    return { min, max };
  };

  const applyLawRecipe = (law, options = {}) => {
    const lawId = law?.id || 'unknown-law';
    const plan = buildLawDrawPlan({ law, bars: data, mapping: lawIndicatorMap });
    if (!options.skipBaseline) {
      applyBaselineIndicatorOverlay(law);
    }

    if (!law?.chartRecipe) {
      const lastBar = data[data.length - 1];
      if (lastBar) {
        addMarker(lastBar.time, lastBar.close, {
          shape: 'circle',
          color: '#9ca3af',
          text: law.id
        }, lawId);
        return true;
      }
      return applyUnknownMappingFallback(law);
    }

    const recipe = law.chartRecipe;
    const needsInputs = Array.isArray(recipe.inputs) && recipe.inputs.length > 0;

    if (needsInputs) {
      return false;
    }

    const range = getDataRange();
    const context = range ? { low: range.low, high: range.high } : {};
    const overlays = Array.isArray(recipe.overlays) ? recipe.overlays : [];

    if (!range && overlays.length) {
      return false;
    }

    overlays.forEach((overlay) => {
      if (!overlay || !overlay.type) return;

      if (overlay.type === 'priceLine') {
        const rawValue = overlay.value ?? overlay.price;
        const price = resolveRecipeValue(rawValue, context);
        addPriceLine(price, {
          color: overlay.color || '#ffffff',
          lineStyle: overlay.lineStyle || LineStyle.Solid,
          lineWidth: overlay.lineWidth || 1,
          title: overlay.label || overlay.title || ''
        }, lawId);
      }

      if (overlay.type === 'marker') {
        const rawValue = overlay.value ?? overlay.price;
        const price = resolveRecipeValue(rawValue, context);
        const markerTime = overlay.time || data[data.length - 1]?.time;
        addMarker(markerTime, price, {
          shape: overlay.shape || 'circle',
          color: overlay.color || '#f59e0b',
          text: overlay.label || overlay.text || ''
        }, lawId);
      }

      if (overlay.type === 'zone') {
        const fromValue = resolveRecipeValue(overlay.from, context);
        const toValue = resolveRecipeValue(overlay.to, context);
        const zoneColor = overlay.color || '#facc15';

        if (Number.isFinite(fromValue)) {
          addPriceLine(fromValue, {
            color: zoneColor,
            lineStyle: overlay.lineStyle || 'dashed',
            lineWidth: overlay.lineWidth || 1,
            title: overlay.label || ''
          }, lawId);
        }

        if (Number.isFinite(toValue)) {
          addPriceLine(toValue, {
            color: zoneColor,
            lineStyle: overlay.lineStyle || 'dashed',
            lineWidth: overlay.lineWidth || 1,
            title: overlay.label || ''
          }, lawId);
        }
      }
    });

    if (!overlays.length) {
      applyUnknownMappingFallback(law);
    }

    applyLawSpecificPlan(law, plan);
    return true;
  };

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) {
      return;
    }

    const activeLaws = Array.isArray(appliedLaws) && appliedLaws.length
      ? appliedLaws
      : appliedLaw
        ? [appliedLaw]
        : [];

    if (!activeLaws.length) {
      clearOverlays();
      if (tutorialActive) {
        endTutorial();
      }
      return;
    }

    const primaryLaw = activeLaws[activeLaws.length - 1];
    const needsInputs = Boolean(primaryLaw?.chartRecipe?.inputs?.length);
    if (needsInputs) {
      clearOverlays();
      activeLaws.forEach((law) => {
        applyUnknownMappingFallback(law);
      });
      if (markersRef.current) {
        markersRef.current.setMarkers(lawOverlayRegistry.current.getMarkers());
      }
      if (!tutorialActive || tutorialLawId !== primaryLaw.id) {
        startTutorial(primaryLaw.id);
      }
      if (onOverlayStatsChange) {
        const rawStats = lawOverlayRegistry.current.getStats();
        const stats = activeLaws.map((law) => {
          const hit = rawStats.find((item) => item.lawId === law.id) || { priceLines: 0, markers: 0, bands: 0 };
          return {
            lawId: law.id,
            hasRecipeOverlays: Boolean(law?.chartRecipe?.overlays?.length),
            hasInputs: Boolean(law?.chartRecipe?.inputs?.length),
            renderedMarkers: hit.markers,
            renderedLines: hit.priceLines,
            renderedBands: hit.bands,
            lawSpecificShapes: 1,
          };
        });
        const signature = JSON.stringify(stats);
        if (signature !== lastStatsSignatureRef.current) {
          lastStatsSignatureRef.current = signature;
          onOverlayStatsChange(stats);
        }
      }
      return;
    }

    clearOverlays();
    const merged = buildMergedRenderPlan({ laws: activeLaws, bars: data, mapping: lawIndicatorMap });
    if (merged?.baseline?.lines?.length || merged?.baseline?.bands?.length) {
      applyBaselineIndicatorOverlay({ id: 'BASELINE_SHARED' });
    }
    activeLaws.forEach((law) => {
      applyLawRecipe(law, { skipBaseline: true });
    });
    if (markersRef.current) {
      markersRef.current.setMarkers(lawOverlayRegistry.current.getMarkers());
    }
    if (onOverlayStatsChange) {
      const stats = activeLaws.map((law) => {
        const plan = merged.stats.find((item) => item.lawId === law.id) || { markersCount: 0, linesCount: 0, boxesCount: 0 };
        return {
          lawId: law.id,
          hasRecipeOverlays: Boolean(law?.chartRecipe?.overlays?.length),
          hasInputs: Boolean(law?.chartRecipe?.inputs?.length),
          renderedMarkers: plan.markersCount,
          renderedLines: plan.linesCount,
          renderedBands: plan.boxesCount,
          lawSpecificShapes: plan.lawSpecificCount || 0,
          unknownReason: plan.unknownReason,
        };
      });
      const signature = JSON.stringify(stats);
      if (signature !== lastStatsSignatureRef.current) {
        lastStatsSignatureRef.current = signature;
        onOverlayStatsChange(stats);
      }
    }
  }, [appliedLaw, appliedLaws, data, tutorialActive, tutorialLawId, startTutorial, endTutorial, onOverlayStatsChange]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = candlestickSeriesRef.current;

    if (!chart || !series) {
      return;
    }

    const handleClick = (param) => {
      if (!tutorialActive || tutorialLawId !== appliedLaw?.id) {
        return;
      }

      const steps = appliedLaw?.tutorialSteps || [];
      const step = steps[tutorialStepIndex];
      const assigns = step?.assigns;

      if (!assigns) {
        return;
      }

      if (!param?.time) {
        return;
      }

      const seriesPrice = param.seriesPrices?.get(series);
      let price = seriesPrice;

      if (price && typeof price === 'object') {
        price = price.close ?? price.value ?? price.open;
      }

      if (!Number.isFinite(price)) {
        const bar = data.find((item) => item.time === param.time);
        price = bar?.close ?? bar?.high ?? bar?.low;
      }

      if (!Number.isFinite(price)) {
        return;
      }

      if (assigns === 'stopPrice' && tutorialInputs.entryPrice) {
        if (price >= tutorialInputs.entryPrice.price) {
          setTutorialError('يجب أن يكون الوقف أدنى من الدخول في السيناريو الافتراضي.');
          return;
        }
      }

      if (assigns === 'rangeLow' && tutorialInputs.rangeHigh) {
        if (price >= tutorialInputs.rangeHigh.price) {
          setTutorialError('يجب أن يكون القاع أقل من القمة المختارة.');
          return;
        }
      }

      if (assigns === 'rangeHigh' && tutorialInputs.rangeLow) {
        if (price <= tutorialInputs.rangeLow.price) {
          setTutorialError('يجب أن تكون القمة أعلى من القاع المختار.');
          return;
        }
      }

      clearTutorialError();

      const { shape, color, position } = getMarkerStyleForInput(assigns);
      const signature = `marker:${lawId}:${time}:${Number(price).toFixed(6)}:${options.shape || 'circle'}:${options.text || ''}`;
    if (dedupeSignatureRef.current.has(signature)) return null;
    dedupeSignatureRef.current.add(signature);

    const marker = {
        time: param.time,
        position,
        shape,
        color,
        size: 1,
        text: assigns
      };

      setMarkerForStep(tutorialStepIndex, marker);
      setTutorialInput(assigns, { time: param.time, price });
      markStepCompleted(tutorialStepIndex);
    };

    if (clickHandlerRef.current) {
      chart.unsubscribeClick(clickHandlerRef.current);
    }

    clickHandlerRef.current = handleClick;
    chart.subscribeClick(handleClick);

    return () => {
      if (clickHandlerRef.current) {
        chart.unsubscribeClick(clickHandlerRef.current);
      }
    };
  }, [
    appliedLaw,
    data,
    tutorialActive,
    tutorialLawId,
    tutorialStepIndex,
    markStepCompleted,
    setTutorialInput,
    setTutorialError,
    clearTutorialError,
    tutorialInputs
  ]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let resizeObserver;

    const ensureChart = (width, heightValue) => {
      if (chartRef.current || !chartContainerRef.current) {
        return;
      }
      if (width <= 0 || heightValue <= 0) {
        return;
      }

      const chart = createChart(chartContainerRef.current, {
        width,
        height: heightValue,
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
      markersRef.current = createSeriesMarkers(candlestickSeries, []);

      if (hasValidBars(dataRef.current)) {
        candlestickSeries.setData(dataRef.current);
        chart.timeScale().fitContent();
      }
    };

    const handleResize = () => {
      if (!chartContainerRef.current) {
        return;
      }
      const width = chartContainerRef.current.clientWidth;
      const heightValue = chartContainerRef.current.clientHeight || height;
      if (width <= 0 || heightValue <= 0) {
        return;
      }

      if (!chartRef.current) {
        ensureChart(width, heightValue);
        return;
      }

      chartRef.current.applyOptions({
        width,
        height: heightValue,
      });
    };

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);
    handleResize();

    return () => {
      clearOverlays();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
        markersRef.current = null;
      }
    };
  }, [height]);

  // Update chart data
  useEffect(() => {
    if (Array.isArray(externalBars)) {
      const { bars: normalized, error } = normalizeBars(externalBars);
      if (error && error !== 'Not enough valid bars') {
        setErrorMessage('تعذر عرض البيانات الحالية. يرجى التحقق من المصدر.');
        setData([]);
        return;
      }
      if (normalized.length < 2) {
        setErrorMessage('');
        setData([]);
        return;
      }
      setErrorMessage('');
      setData(normalized);
    }
  }, [externalBars]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !hasValidBars(data)) {
      return;
    }
    try {
      candlestickSeriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    } catch (error) {
      console.error('Error setting chart data:', error);
      setErrorMessage('تعذر عرض البيانات الحالية. يرجى التحقق من الملف.');
    }
  }, [data]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !latestBar) {
      return;
    }
    const lastDataTime = data[data.length - 1]?.time;
    if (!Number.isFinite(lastDataTime) || !Number.isFinite(latestBar.time)) {
      return;
    }
    if (latestBar.time < lastDataTime) {
      return;
    }
    const isValidLatest = [latestBar.time, latestBar.open, latestBar.high, latestBar.low, latestBar.close]
      .every((value) => Number.isFinite(value));
    if (!isValidLatest) {
      return;
    }
    try {
      candlestickSeriesRef.current.update(latestBar);
    } catch (error) {
      console.error('Error updating latest bar:', error);
    }
  }, [latestBar]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !hasValidBars(data)) {
      return;
    }

    const series = candlestickSeriesRef.current;
    const range = computeMinMax(data);
    if (!range) {
      return;
    }
    const { min: minPrice, max: maxPrice } = range;

    const getLevel = (ratio) => minPrice + (maxPrice - minPrice) * ratio;

    if (equilibriumLineRef.current) {
      series.removePriceLine(equilibriumLineRef.current);
      equilibriumLineRef.current = null;
    }

    keyLevelLinesRef.current.forEach((line) => series.removePriceLine(line));
    keyLevelLinesRef.current = [];

    zoneLinesRef.current.forEach((line) => series.removePriceLine(line));
    zoneLinesRef.current = [];

    if (showEquilibrium) {
      equilibriumLineRef.current = series.createPriceLine({
        price: getLevel(0.236),
        color: '#f97316',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '0.236 الاتزان'
      });
    }

    if (showKeyLevels) {
      const keyRatios = [0.382, 0.5, 0.618, 0.786];
      keyLevelLinesRef.current = keyRatios.map((ratio) =>
        series.createPriceLine({
          price: getLevel(ratio),
          color: '#60a5fa',
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: ratio.toString()
        })
      );
    }

    if (showZones) {
      const safeRatios = [0.236, 0.786];
      const optimalRatios = [0.382, 0.618];
      const safeLines = safeRatios.map((ratio) =>
        series.createPriceLine({
          price: getLevel(ratio),
          color: '#facc15',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: ratio === 0.236 ? 'حد الآمن' : 'حد الآمن الأعلى'
        })
      );
      const optimalLines = optimalRatios.map((ratio) =>
        series.createPriceLine({
          price: getLevel(ratio),
          color: '#22c55e',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: ratio === 0.382 ? 'المنطقة المثلى' : ''
        })
      );
      zoneLinesRef.current = [...safeLines, ...optimalLines];
    }
  }, [data, showEquilibrium, showKeyLevels, showZones]);

  const normalizeKey = (value) =>
    String(value ?? '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, '');

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

  const normalizeDateTimeString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    const sanitized = trimmed.replace(/\./g, '-');
    if (sanitized.includes(' ') && !sanitized.includes('T')) {
      return sanitized.replace(' ', 'T');
    }
    return sanitized;
  };

  const parseDateValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = normalizeDateTimeString(trimmed);
    const parts = normalized.split('-');
    if (parts.length === 3) {
      const [first, second, third] = parts;
      if (first.length === 4) {
        return normalized;
      }
      if (third.length === 4) {
        return `${third}-${second}-${first}`;
      }
    }
    return normalized;
  };

  const parseTime = (row) => {
    const dateValue = getField(row, ['date', 'day', 'التاريخ', 'تاريخ']);
    const timeValue = getField(row, ['time', 'hour', 'الوقت', 'ساعة', 'الزمن']);
    const dateTimeValue = getField(row, [
      'datetime',
      'date_time',
      'date time',
      'timestamp',
      'time stamp',
      'date_time_utc',
      'datetimeutc',
      'datetimeutc',
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
      const epochMs = Date.parse(normalizeDateTimeString(String(dateTimeValue)));
      return Number.isNaN(epochMs) ? null : Math.floor(epochMs / 1000);
    }

    if (Number.isFinite(Number(dateValue))) {
      return parseEpochSeconds(dateValue);
    }

    if (dateValue && timeValue) {
      const normalizedDate = parseDateValue(dateValue);
      const normalizedTime = String(timeValue).trim();
      const epoch = Date.parse(`${normalizedDate}T${normalizedTime}Z`);
      return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
    }

    if (dateValue) {
      const normalizedDate = parseDateValue(dateValue);
      const epoch = Date.parse(`${normalizedDate}T00:00:00Z`);
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
        const open = parseNumber(
          getField(row, ['open', 'o', 'openprice', 'open_price', 'افتتاح', 'فتح'])
        );
        const high = parseNumber(
          getField(row, ['high', 'h', 'highprice', 'high_price', 'اعلى', 'أعلى', 'مرتفع'])
        );
        const low = parseNumber(
          getField(row, ['low', 'l', 'lowprice', 'low_price', 'منخفض', 'ادنى', 'أدنى'])
        );
        const close = parseNumber(
          getField(row, [
            'close',
            'c',
            'closeprice',
            'close_price',
            'last',
            'lastprice',
            'closeprice',
            'اغلاق',
            'إغلاق',
            'آخر',
          ])
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
      const response = await fetch(`${import.meta.env.BASE_URL}sample-data.csv`);
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { bars, error } = normalizeBars(buildChartData(results.data));
          if (error) {
            setErrorMessage('تعذر قراءة البيانات التجريبية. يرجى التحقق من الملف.');
            setData([]);
          } else {
            setData(bars);
          }
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
        const { bars, error } = normalizeBars(buildChartData(results.data));
        if (error) {
          setErrorMessage('لم يتم العثور على بيانات صالحة في الملف.');
          setData([]);
        } else {
          setData(bars);
        }
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
        advancedControls ? (
          <details style={{ marginBottom: '0.5rem' }}>
            <summary>خيارات متقدمة (CSV)</summary>
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
          </details>
        ) : (
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
        )
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
      {!errorMessage && !isLoading && !hasValidBars(data) && (
        <div className="chart-error" role="status">
          اختر الأداة والإطار الزمني ثم اضغط تحميل، أو استخدم CSV المتقدم.
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
