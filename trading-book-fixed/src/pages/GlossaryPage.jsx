import './SimplePage.css';
import { getTermId, terms } from '../data/terms';

const GlossaryPage = () => {
  return (
    <div className="simple-page">
      <h1 className="page-title">معجم المصطلحات</h1>
      <p className="page-subtitle">المصطلحات الأساسية في مدرسة قياسات الفوضى</p>
      
      <div className="terms-list">
        {terms.map((item) => (
          <div key={item.term} id={getTermId(item.term)} className="term-card">
            <h3 className="term-title">{item.term}</h3>
            <p className="term-definition">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryPage;
