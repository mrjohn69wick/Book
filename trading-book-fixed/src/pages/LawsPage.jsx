import { useState } from 'react';
import { laws, getLawsByCategory } from '../data/laws';
import './LawsPage.css';

const LawsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'مدرسة', label: 'مدرسة' },
    { id: 'مؤشر', label: 'مؤشر' },
    { id: 'كوني', label: 'كوني' },
    { id: 'ذكاء اصطناعي', label: 'ذكاء اصطناعي' },
    { id: 'مشترك', label: 'مشترك' },
    { id: 'تطبيق', label: 'تطبيق' }
  ];
  
  const filteredLaws = laws.filter(law => {
    const matchesCategory = selectedCategory === 'all' || law.category === selectedCategory;
    const matchesSearch = law.title.includes(searchQuery) || 
                          law.summary.includes(searchQuery) ||
                          law.id.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const groupedLaws = filteredLaws.reduce((acc, law, index) => {
    const previousLaw = filteredLaws[index - 1];
    if (!previousLaw || previousLaw.category !== law.category) {
      acc.push({ type: 'header', category: law.category });
    }
    acc.push({ type: 'law', law });
    return acc;
  }, []);

  return (
    <div className="laws-page">
      <div className="laws-header">
        <h1 className="page-title">سجل القوانين</h1>
        <p className="page-subtitle">استعرض جميع القوانين مع إمكانية التطبيق المباشر</p>
      </div>

      <div className="laws-filters">
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label} ({cat.id === 'all' ? laws.length : getLawsByCategory(cat.id).length})
            </button>
          ))}
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="ابحث في القوانين..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="laws-grid">
        {groupedLaws.map((item) => {
          if (item.type === 'header') {
            return (
              <div key={`header-${item.category}`} className="laws-group-header">
                <span className="group-badge" style={{ background: getCategoryColor(item.category) }}>
                  {getCategoryLabel(item.category)}
                </span>
              </div>
            );
          }

          const { law } = item;
          return (
            <div key={law.id} id={law.id} className="law-card">
              <div className="law-card-header">
                <span className="law-badge" style={{ background: getCategoryColor(law.category) }}>
                  {law.id}
                </span>
                <span className="law-category">{law.category}</span>
              </div>
              <h3 className="law-card-title">{law.title}</h3>
              <p className="law-card-summary">{law.summary}</p>
              <button className="btn-view">عرض التفاصيل</button>
            </div>
          );
        })}
      </div>

      {filteredLaws.length === 0 && (
        <div className="no-results">
          <p>لا توجد قوانين تطابق البحث</p>
        </div>
      )}
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

function getCategoryLabel(category) {
  const labels = {
    'مدرسة': '📗 قوانين المدرسة',
    'مؤشر': '📘 قوانين المؤشر',
    'كوني': '🪐 قوانين النظام الكوني',
    'ذكاء اصطناعي': '🤖 قوانين الذكاء الاصطناعي',
    'مشترك': '🔗 القوانين المشتركة',
    'تطبيق': '🧩 قوانين التطبيق'
  };
  return labels[category] || category;
}

export default LawsPage;
