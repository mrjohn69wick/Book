import { useState, useEffect } from 'react';
import { laws } from '../data/laws';
import LightweightChart from '../components/LightweightChart';
import './LearnPage.css';

const LearnPage = () => {
  const [currentLawIndex, setCurrentLawIndex] = useState(0);
  const [completedLaws, setCompletedLaws] = useState([]);
  const [appliedLaw, setAppliedLaw] = useState(null);

  const currentLaw = laws[currentLawIndex];
  const progress = Math.round(((currentLawIndex + 1) / laws.length) * 100);

  useEffect(() => {
    // Load completed laws from localStorage
    const saved = localStorage.getItem('completed-laws');
    if (saved) {
      setCompletedLaws(JSON.parse(saved));
    }
  }, []);

  const handleNext = () => {
    if (currentLawIndex < laws.length - 1) {
      setCurrentLawIndex(currentLawIndex + 1);
      setAppliedLaw(null);
    }
  };

  const handlePrevious = () => {
    if (currentLawIndex > 0) {
      setCurrentLawIndex(currentLawIndex - 1);
      setAppliedLaw(null);
    }
  };

  const handleMarkComplete = () => {
    if (!completedLaws.includes(currentLaw.id)) {
      const updated = [...completedLaws, currentLaw.id];
      setCompletedLaws(updated);
      localStorage.setItem('completed-laws', JSON.stringify(updated));
      localStorage.setItem('trading-book-progress', JSON.stringify({
        completed: updated.length,
        total: laws.length
      }));
    }
  };

  const handleApplyToChart = () => {
    setAppliedLaw(currentLaw);
  };

  const isCompleted = completedLaws.includes(currentLaw.id);

  return (
    <div className="learn-page">
      <div className="learn-header">
        <h1 className="page-title">التعلم خطوة بخطوة</h1>
        <p className="page-subtitle">تعلم القوانين بالترتيب مع التطبيق العملي على الشارت</p>
        <div className="learn-progress">
          <span className="progress-text">القانون {currentLawIndex + 1} من {laws.length}</span>
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
              {currentLaw.conditions.map((condition, idx) => (
                <li key={idx}>{condition}</li>
              ))}
            </ul>
          </div>

          <div className="law-section">
            <h3 className="section-title">النتائج المتوقعة:</h3>
            <ul className="section-list">
              {currentLaw.expectedResults.map((result, idx) => (
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
              {currentLaw.sources.map((source, idx) => (
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
          <LightweightChart height={500} showControls={true} />
          
          <div className="applied-law-info">
            <h3 className="info-title">📍 القانون المطبق</h3>
            {appliedLaw ? (
              <div className="applied-law-card">
                <h4>{appliedLaw.title}</h4>
                <p>اضغط على "طبّق الآن" لأي قانون لعرض التفسير هنا</p>
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
    'تطبيق': '#f59e0b'
  };
  return colors[category] || '#6366f1';
}

export default LearnPage;
