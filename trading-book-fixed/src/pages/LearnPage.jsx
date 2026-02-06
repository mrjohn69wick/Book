import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { laws, getLawById } from '../data/laws';
import LightweightChart from '../components/LightweightChart';
import './LearnPage.css';
import { useAppliedLaw } from '../context/AppliedLawContext';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';
import ChartErrorBoundary from '../components/ChartErrorBoundary';
import MarketPanel from '../components/MarketPanel';
import { useMarketData } from '../context/MarketDataContext';

const LearnPage = ({ lawId }) => {
  const initialIndex = lawId
    ? laws.findIndex((law) => law.id === lawId)
    : 0;
  const [currentLawIndex, setCurrentLawIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );
  const [completedLaws, setCompletedLaws] = useState([]);
  const { appliedLawId, setAppliedLawId } = useAppliedLaw();
  const { bars, latestBar, instrumentId, timeframeId } = useMarketData();
  const [, navigate] = useLocation();

  const currentLaw = laws[currentLawIndex];
  const totalLaws = laws.length;
  const completedIds = Array.isArray(completedLaws) ? completedLaws : [];
  const completedCount = Math.min(new Set(completedIds).size, totalLaws);
  const progress = totalLaws > 0 ? Math.round((completedCount / totalLaws) * 100) : 0;
  const appliedLaw = appliedLawId ? getLawById(appliedLawId) : null;
  const isChartDisabled = localStorage.getItem(keys.disableChart) === '1';

  useEffect(() => {
    // Load completed laws from localStorage
    const stored = safeGetJSON(keys.completedLawIds, []);
    setCompletedLaws(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    if (lawId) {
      const newIndex = laws.findIndex((law) => law.id === lawId);
      if (newIndex >= 0) {
        setCurrentLawIndex(newIndex);
      }
    }
  }, [lawId]);

  const handleNext = () => {
    if (currentLawIndex < laws.length - 1) {
      setCurrentLawIndex(currentLawIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLawIndex > 0) {
      setCurrentLawIndex(currentLawIndex - 1);
    }
  };

  const handleMarkComplete = () => {
    if (!completedLaws.includes(currentLaw.id)) {
      const updated = Array.from(new Set([...completedLaws, currentLaw.id]));
      setCompletedLaws(updated);
      safeSetJSON(keys.completedLawIds, updated);
      safeSetJSON(keys.progress, {
        completed: updated.length,
        total: laws.length
      });
    }
  };

  const handleApplyToChart = () => {
    setAppliedLawId(currentLaw.id);
    navigate('/chart');
  };

  const conditions = Array.isArray(currentLaw.conditions) ? currentLaw.conditions : [];
  const expectedResults = Array.isArray(currentLaw.expectedResults) ? currentLaw.expectedResults : [];
  const sources = Array.isArray(currentLaw.sources) ? currentLaw.sources : [];
  const isCompleted = completedLaws.includes(currentLaw.id);
  const sectionLabel = getSectionLabel(currentLaw.category);

  return (
    <div className="learn-page">
      <div className="learn-header">
        <h1 className="page-title">التعلم خطوة بخطوة</h1>
        <p className="page-subtitle">تعلم القوانين بالترتيب مع التطبيق العملي على الشارت</p>
        <div className="learn-section-label">{sectionLabel}</div>
        <div className="learn-progress">
          <span className="progress-text">{completedCount} / {totalLaws}</span>
          <span className="progress-percent">{progress}%</span>
        </div>
      </div>

      <div className="learn-content">
        <div className="law-content">
          <div className="law-header">
            <div className="law-badge" style={{ background: getCategoryColor(currentLaw.category) }}>
              {currentLaw.id}
            </div>
            <span className="law-category">{currentLaw.category}</span>
          </div>

          <h2 className="law-title">{currentLaw.title}</h2>

          <div className="law-section">
            <h3 className="section-title">الملخص:</h3>
            <p className="section-content">{currentLaw.summary}</p>
          </div>

          <div className="law-section">
            <h3 className="section-title">التفصيل:</h3>
            <p className="section-content">{currentLaw.details}</p>
          </div>

          <div className="law-section">
            <h3 className="section-title">شروط التطبيق:</h3>
            <ul className="section-list">
              {conditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            </ul>
          </div>

          <div className="law-section">
            <h3 className="section-title">النتائج المتوقعة:</h3>
            <ul className="section-list">
              {expectedResults.map((result, idx) => (
                <li key={idx}>{result}</li>
              ))}
            </ul>
          </div>

          <div className="law-section">
            <h3 className="section-title">مثال عملي:</h3>
            <p className="section-content example">{currentLaw.example}</p>
          </div>

          <div className="law-section">
            <h3 className="section-title">المصادر:</h3>
            <div className="sources">
              {sources.map((source, idx) => (
                <span key={idx} className="source-badge">{source}</span>
              ))}
            </div>
          </div>

          <div className="law-actions">
            <button 
              className="btn-apply"
              onClick={handleApplyToChart}
            >
              📊 طبّق على الشارت
            </button>
            <button 
              className={`btn-complete ${isCompleted ? 'completed' : ''}`}
              onClick={handleMarkComplete}
              disabled={isCompleted}
            >
              {isCompleted ? '✓ مكتمل' : 'وضّع كمكتمل'}
            </button>
          </div>

          <div className="law-navigation">
            <button 
              onClick={handlePrevious} 
              disabled={currentLawIndex === 0}
              className="btn-nav"
            >
              السابق
            </button>
            <span className="nav-indicator">
              {currentLawIndex + 1} / {laws.length}
            </span>
            <button 
              onClick={handleNext} 
              disabled={currentLawIndex === laws.length - 1}
              className="btn-nav"
            >
              التالي
            </button>
          </div>
        </div>

        <div className="chart-section">
          {isChartDisabled ? (
            <div className="chart-error" role="alert">
              تم تعطيل الشارت مؤقتًا. أزل المفتاح من التخزين المحلي لإعادة التفعيل.
            </div>
          ) : (
            <ChartErrorBoundary
              symbol={instrumentId}
              timeframe={timeframeId}
              barsCount={bars.length}
              lastBarTime={bars[bars.length - 1]?.time}
            >
              <MarketPanel />
              <LightweightChart
                height={500}
                showControls={true}
                advancedControls={true}
                appliedLaw={appliedLaw}
                externalBars={bars}
                latestBar={latestBar}
              />
            </ChartErrorBoundary>
          )}
          
          <div className="applied-law-info">
            <h3 className="info-title">📍 القانون المطبق</h3>
            {appliedLaw ? (
              <div className="applied-law-card">
                <h4>{appliedLaw.title}</h4>
                <p>{appliedLaw.summary}</p>
              </div>
            ) : (
              <p className="no-law-applied">لم يتم تطبيق أي قانون بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getCategoryColor(category) {
  const colors = {
    'مدرسة': '#6366f1',
    'مؤشر': '#10b981',
    'كوني': '#f97316',
    'ذكاء اصطناعي': '#22c55e',
    'مشترك': '#a855f7',
    'تطبيق': '#f59e0b'
  };
  return colors[category] || '#6366f1';
}

function getSectionLabel(category) {
  const labels = {
    'مدرسة': '📗 قوانين المدرسة',
    'مؤشر': '📘 قوانين المؤشر',
    'كوني': '🪐 قوانين النظام الكوني',
    'ذكاء اصطناعي': '🤖 قوانين الذكاء الاصطناعي',
    'مشترك': '🔗 القوانين المشتركة',
    'تطبيق': '🧩 قوانين التطبيق'
  };
  return labels[category] || '📚 القوانين';
}

export default LearnPage;
