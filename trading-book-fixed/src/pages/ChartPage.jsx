import { useState } from 'react';
import LightweightChart from '../components/LightweightChart';
import './ChartPage.css';

const ChartPage = () => {
  const [appliedLaw, setAppliedLaw] = useState(null);
  const [showEquilibrium, setShowEquilibrium] = useState(true);
  const [showKeyLevels, setShowKeyLevels] = useState(false);
  const [showZones, setShowZones] = useState(false);

  const quickLaws = [
    { id: 'LAW_001', name: 'لا شك ليست حتمية', color: '#6366f1' },
    { id: 'LAW_002', name: 'قاعدة الانضباط', color: '#10b981' },
    { id: 'LAW_003', name: 'الوقف وعكس الوقف', color: '#f59e0b' },
    { id: 'LAW_004', name: 'الخادش', color: '#8b5cf6' },
    { id: 'LAW_005', name: 'اتزانات الفوضى', color: '#ef4444' }
  ];

  const handleApplyLaw = (law) => {
    setAppliedLaw(law);
  };

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
          <LightweightChart
            height={600}
            showControls={true}
            showEquilibrium={showEquilibrium}
            showKeyLevels={showKeyLevels}
            showZones={showZones}
          />
        </div>

        <div className="chart-sidebar">
          <div className="law-panel">
            <h3 className="panel-title">📍 القانون المطبق</h3>
            {appliedLaw ? (
              <div className="applied-law" style={{ borderColor: appliedLaw.color }}>
                <div className="law-badge" style={{ background: appliedLaw.color }}>
                  {appliedLaw.id}
                </div>
                <h4 className="law-name">{appliedLaw.name}</h4>
                <p className="law-explanation">
                  اضغط على "طبّق الآن" لأي قانون لعرض التفسير هنا
                </p>
                <button 
                  className="btn-remove"
                  onClick={() => setAppliedLaw(null)}
                >
                  إزالة التطبيق
                </button>
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

export default ChartPage;
