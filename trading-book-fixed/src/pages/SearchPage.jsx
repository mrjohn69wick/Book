import { useMemo, useState } from 'react';
import { laws } from '../data/laws';
import { getTermId, terms } from '../data/terms';
import './SimplePage.css';

const normalizeText = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();

const lawSearchContent = (law) => [
  law.id,
  law.title,
  law.summary,
  law.details,
  ...(law.conditions || []),
  ...(law.expectedResults || []),
  law.example,
  ...(law.sources || [])
];

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalizeText(query);

  const lawResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return laws.filter((law) =>
      lawSearchContent(law).some((value) => normalizeText(value)?.includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  const termResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return terms.filter((item) =>
      [item.term, item.definition].some((value) => normalizeText(value)?.includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  return (
    <div className="simple-page">
      <h1 className="page-title">البحث</h1>
      <p className="page-subtitle">ابحث في القوانين والمصطلحات بسرعة.</p>
      <input
        type="search"
        placeholder="ابحث في القوانين أو المصطلحات..."
        className="search-input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {!normalizedQuery && <p className="search-hint">ابدأ بكتابة كلمة أو رقم قانون.</p>}

      {normalizedQuery && (
        <div className="search-results">
          <div className="search-section">
            <h3 className="search-section-title">نتائج القوانين</h3>
            {lawResults.length === 0 && <p className="search-empty">لا توجد نتائج مطابقة.</p>}
            {lawResults.map((law) => (
              <a key={law.id} href={`#/laws#${law.id}`} className="search-result">
                <span className="search-result-title">{law.title}</span>
                <span className="search-result-meta">{law.id}</span>
              </a>
            ))}
          </div>

          <div className="search-section">
            <h3 className="search-section-title">نتائج المصطلحات</h3>
            {termResults.length === 0 && <p className="search-empty">لا توجد نتائج مطابقة.</p>}
            {termResults.map((item) => (
              <a key={item.term} href={`#/glossary#${getTermId(item.term)}`} className="search-result">
                <span className="search-result-title">{item.term}</span>
                <span className="search-result-meta">مصطلح</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchPage;
