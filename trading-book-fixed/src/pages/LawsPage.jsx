import { useState } from 'react';
import { laws, getLawsByCategory } from '../data/laws';
import './LawsPage.css';

const LawsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'مدرسة', 'مؤشر', 'تطبيق'];
  
  const filteredLaws = laws.filter(law => {
    const matchesCategory = selectedCategory === 'all' || law.category === selectedCategory;
    const matchesSearch = law.title.includes(searchQuery) || 
                          law.summary.includes(searchQuery) ||
                          law.id.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="laws-page">
      <div className="laws-header">
        <h1 className="page-title">سجل القوانين</h1>
        <p className="page-subtitle">استعرض جميع القوانين مع إمكانية التطبيق المباشر</p>
      </div>

      <div className="laws-filters">
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'الكل' : cat} ({cat === 'all' ? laws.length : getLawsByCategory(cat).length})
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
        {filteredLaws.map(law => (
          <div key={law.id} className="law-card">
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
        ))}
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
    'تطبيق': '#f59e0b'
  };
  return colors[category] || '#6366f1';
}

export default LawsPage;
