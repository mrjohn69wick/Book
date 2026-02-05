import { useEffect, useState } from 'react';
import './SimplePage.css';

const SettingsPage = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.body.classList.toggle('theme-light', initialTheme === 'light');
  }, []);

  const handleThemeChange = (event) => {
    const nextTheme = event.target.checked ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme-preference', nextTheme);
    document.body.classList.toggle('theme-light', nextTheme === 'light');
  };

  return (
    <div className="simple-page">
      <h1 className="page-title">الإعدادات</h1>
      <p className="page-subtitle">خصص تجربتك في الكتاب التفاعلي</p>

      <div className="settings-card">
        <h2 className="settings-title">المظهر</h2>
        <p className="settings-description">بدّل بين الوضع الداكن والفاتح حسب تفضيلك.</p>
        <label className="settings-toggle">
          <span>الوضع الفاتح</span>
          <input type="checkbox" checked={theme === 'light'} onChange={handleThemeChange} />
        </label>
      </div>
    </div>
  );
};
export default SettingsPage;
