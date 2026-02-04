import { useState } from 'react';
import LightweightChart from '../components/LightweightChart';
import './ChartPage.css';

const ChartPage = () => {
  const [appliedLaw, setAppliedLaw] = useState(null);

  const quickLaws = [
    { id: 'LAW_001', name: 'إدارة الاحتمالات', color: '#6366f1' },
    { id: 'LAW_002', name: 'الاحتمالات الثلاثية', color: '#10b981' },
    { id: 'LAW_003', name: 'المؤشر الأساسي', color: '#f59e0b' },
    { id: 'LAW_004', name: 'التأكيد المتعدد', color: '#8b5cf6' },
    { id: 'LAW_005', name: 'إدارة رأس المال', color: '#ef4444' }
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
          <LightweightChart height={600} showControls={true} />
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
