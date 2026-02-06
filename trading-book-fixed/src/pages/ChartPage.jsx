import { useState } from 'react';
import LightweightChart from '../components/LightweightChart';
import './ChartPage.css';
import { getLawById } from '../data/laws';
import { useAppliedLaw } from '../context/AppliedLawContext';
import ChartErrorBoundary from '../components/ChartErrorBoundary';
import { keys } from '../utils/storage';

const ChartPage = () => {
  const {
    appliedLawId,
    setAppliedLawId,
    tutorialActive,
    tutorialLawId,
    tutorialStepIndex,
    tutorialStepCompleted,
    tutorialError,
    startTutorial,
    endTutorial,
    clearTutorialError,
    nextTutorialStep,
    previousTutorialStep
  } = useAppliedLaw();
  const [showEquilibrium, setShowEquilibrium] = useState(true);
  const [showKeyLevels, setShowKeyLevels] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const appliedLaw = appliedLawId ? getLawById(appliedLawId) : null;
  const appliedLawColor = appliedLaw?.color ?? getCategoryColor(appliedLaw?.category);
  const needsInputs = Boolean(appliedLaw?.chartRecipe?.inputs?.length);
  const isTutorialActive = tutorialActive && tutorialLawId === appliedLawId;
  const tutorialStep = isTutorialActive
    ? appliedLaw?.tutorialSteps?.[tutorialStepIndex]
    : null;
  const stepRequiresInput = Boolean(tutorialStep?.assigns);
  const isStepComplete = Boolean(tutorialStepCompleted[tutorialStepIndex]);
  const tutorialStepsCount = appliedLaw?.tutorialSteps?.length ?? 0;
  const isLastStep = Boolean(tutorialStepsCount && tutorialStepIndex === tutorialStepsCount - 1);
  const isChartDisabled = localStorage.getItem(keys.disableChart) === '1';

  const quickLaws = [
    { id: 'LAW_001', name: 'لا شك ليست حتمية', color: '#6366f1' },
    { id: 'LAW_002', name: 'قاعدة الانضباط', color: '#10b981' },
    { id: 'LAW_003', name: 'الوقف وعكس الوقف', color: '#f59e0b' },
    { id: 'LAW_004', name: 'الخادش', color: '#8b5cf6' },
    { id: 'LAW_005', name: 'اتزانات الفوضى', color: '#ef4444' }
  ];

  const handleApplyLaw = (law) => {
    setAppliedLawId(law.id);
    clearTutorialError();
    if (law?.chartRecipe?.inputs?.length) {
      startTutorial(law.id);
    } else {
      endTutorial();
    }
  };

  const hasRecipeOverlays = Boolean(appliedLaw?.chartRecipe?.overlays?.length);
  const showConditions = Boolean(appliedLaw && !needsInputs && !hasRecipeOverlays);

  return (
    <div className="chart-page">
      <div className="chart-header">
        <h1 className="page-title">الشارت التفاعلي</h1>
        <p className="page-subtitle">
          حمّل بياناتك الخاصة أو استخدم البيانات التجريبية، ثم طبّق القوانين مباشرة على الشارت
        </p>
      </div>

      <div className="chart-layout">
        <div className="chart-main">
          <div className="overlay-controls">
            <div className="overlay-header">
              <h3>🎯 أدوات الإيضاح البصري</h3>
              <p>خطوط إرشادية لتوضيح نسب النظام على بياناتك.</p>
            </div>
            <div className="overlay-options">
              <label className="overlay-option">
                <input
                  type="checkbox"
                  checked={showEquilibrium}
                  onChange={(event) => setShowEquilibrium(event.target.checked)}
                />
                عرض مستوى الاتزان 0.236
              </label>
              <label className="overlay-option">
                <input
                  type="checkbox"
                  checked={showKeyLevels}
                  onChange={(event) => setShowKeyLevels(event.target.checked)}
                />
                عرض المستويات الرئيسية (0.382 / 0.5 / 0.618 / 0.786)
              </label>
              <label className="overlay-option">
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(event) => setShowZones(event.target.checked)}
                />
                إبراز حدود المنطقة الآمنة والمثلى
              </label>
            </div>
            <p className="overlay-note">
              هذه الخطوط إرشادية للتعلم وليست توصية تداول مباشرة.
            </p>
          </div>
          {isChartDisabled ? (
            <div className="chart-error" role="alert">
              تم تعطيل الشارت مؤقتًا. أزل المفتاح من التخزين المحلي لإعادة التفعيل.
            </div>
          ) : (
            <ChartErrorBoundary>
              <LightweightChart
                height={600}
                showControls={true}
                showEquilibrium={showEquilibrium}
                showKeyLevels={showKeyLevels}
                showZones={showZones}
                appliedLaw={appliedLaw}
              />
            </ChartErrorBoundary>
          )}
        </div>

        <div className="chart-sidebar">
          <div className="law-panel">
            <h3 className="panel-title">📍 القانون المطبق</h3>
            {appliedLaw ? (
              <div className="applied-law" style={{ borderColor: appliedLawColor }}>
                <div className="law-badge" style={{ background: appliedLawColor }}>
                  {appliedLaw.id}
                </div>
                <h4 className="law-name">{appliedLaw.title}</h4>
                <p className="law-explanation">
                  {needsInputs
                    ? (tutorialStep?.text || 'يتطلب هذا القانون تحديد نقاط على الشارت قبل التطبيق.')
                    : (appliedLaw.summary || 'تم تطبيق القانون على الشارت.')}
                </p>
                {needsInputs && isTutorialActive && (
                  <div className="tutorial-controls">
                    {tutorialError && (
                      <p className="tutorial-error">{tutorialError}</p>
                    )}
                    <div className="tutorial-buttons">
                      {tutorialStepIndex > 0 && (
                        <button
                          className="btn-remove"
                          onClick={previousTutorialStep}
                        >
                          السابق
                        </button>
                      )}
                      {isLastStep ? (
                        <button
                          className="btn-remove"
                          onClick={endTutorial}
                          disabled={stepRequiresInput && !isStepComplete}
                        >
                          إتمام
                        </button>
                      ) : (
                        <button
                          className="btn-remove"
                          onClick={nextTutorialStep}
                          disabled={stepRequiresInput && !isStepComplete}
                        >
                          التالي
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <button 
                  className="btn-remove"
                  onClick={() => {
                    setAppliedLawId(null);
                    clearTutorialError();
                    endTutorial();
                  }}
                >
                  إزالة التطبيق
                </button>
                {showConditions && (
                  <ul className="law-conditions">
                    {appliedLaw.conditions.map((condition, index) => (
                      <li key={index}>✅ {condition}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="no-law">
                <p>لم يتم تطبيق أي قانون بعد</p>
                <p className="hint">اختر قانوناً من القائمة أدناه</p>
              </div>
            )}
          </div>

          <div className="quick-laws">
            <h3 className="panel-title">⚡ تطبيق سريع</h3>
            <div className="laws-list">
              {quickLaws.map((law) => (
                <button
                  key={law.id}
                  className="law-button"
                  style={{ '--law-color': law.color }}
                  onClick={() => handleApplyLaw(law)}
                >
                  <span className="law-id">{law.id}</span>
                  <span className="law-name-short">{law.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chart-info">
            <h3 className="panel-title">ℹ️ معلومات</h3>
            <ul className="info-list">
              <li>استخدم CSV بتنسيق: Date,Open,High,Low,Close,Volume</li>
              <li>التاريخ بصيغة: YYYY-MM-DD</li>
              <li>الأسعار والحجم أرقام عشرية</li>
              <li>يمكنك تطبيق عدة قوانين معاً</li>
            </ul>
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

export default ChartPage;
