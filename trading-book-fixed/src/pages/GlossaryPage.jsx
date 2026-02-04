import './SimplePage.css';

const GlossaryPage = () => {
  const terms = [
    { term: 'الفوضى التراكمية', definition: 'مفهوم أساسي في المدرسة يصف تراكم الحركات العشوائية في السوق' },
    { term: 'عكس الوقف', definition: 'تحويل وقف الخسارة إلى فرصة دخول في الاتجاه المعاكس' },
    { term: 'الاحتمالات الثلاثية', definition: 'تقسيم السوق إلى ثلاثة احتمالات: صعود، هبوط، وجانبي' }
  ];

  return (
    <div className="simple-page">
      <h1 className="page-title">معجم المصطلحات</h1>
      <p className="page-subtitle">المصطلحات الأساسية في مدرسة قياسات الفوضى</p>
      
      <div className="terms-list">
        {terms.map((item, idx) => (
          <div key={idx} className="term-card">
            <h3 className="term-title">{item.term}</h3>
            <p className="term-definition">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryPage;
