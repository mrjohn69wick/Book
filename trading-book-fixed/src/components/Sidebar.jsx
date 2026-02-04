import { Link, useLocation } from 'wouter';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const [location] = useLocation();

  const menuItems = [
    { path: '/', label: 'الرئيسية', icon: '🏠' },
    { path: '/learn', label: 'التعلم خطوة بخطوة', icon: '📚' },
    { path: '/laws', label: 'سجل القوانين', icon: '⚖️' },
    { path: '/glossary', label: 'معجم المصطلحات', icon: '📖' },
    { path: '/training', label: 'حالات التدريب', icon: '💪' },
    { path: '/chart', label: 'الشارت التفاعلي', icon: '📊' },
    { path: '/mt5', label: 'MT5 WebTerminal', icon: '💹' },
    { path: '/search', label: 'البحث', icon: '🔍' },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️' }
  ];

  const sections = [
    {
      title: 'الفصول',
      items: [
        { path: '/learn', label: 'ملاحظة منهجية سريعة (قبل القراءة)' },
        { path: '/learn', label: 'منهجية V3 وأولوية المصادر' },
        { path: '/learn', label: 'سجل التناقضات وحلها (V3 Conflict Log)' },
        { path: '/learn', label: 'خريطة المحتوى' },
        { path: '/learn', label: 'الملخص التنفيذي' }
      ]
    }
  ];

  return (
    <>
      <button 
        className="sidebar-toggle" 
        onClick={onToggle}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? '✕' : '☰'}
      </button>
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">مدرسة قياسات الفوضى</h1>
          <p className="sidebar-subtitle">الكتاب التفاعلي الشامل</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`nav-item ${location === item.path ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="sidebar-sections">
          {sections.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-list">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link href={item.path}>
                      <a className="section-link">{item.label}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
