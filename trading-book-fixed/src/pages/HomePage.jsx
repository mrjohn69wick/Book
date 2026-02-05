import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { laws } from '../data/laws';
import './HomePage.css';

const HomePage = () => {
  const prodUrl = `${import.meta.env.BASE_URL}trading-book-PRODUCTION-READY/`;
  const [completedCount, setCompletedCount] = useState(0);
  const totalLaws = laws.length;
  const features = [
    {
      title: 'التعلم خطوة بخطوة',
      description: 'ابدأ رحلتك التعليمية من الأساسيات حتى الاحتراف',
      icon: '📚',
      link: '/learn',
      color: '#6366f1'
    },
    {
      title: 'سجل القوانين',
      description: 'استعرض جميع القوانين مع إمكانية التطبيق المباشر',
      icon: '⚖️',
      link: '/laws',
      color: '#10b981'
    },
    {
      title: 'حالات التدريب',
      description: 'تمرن على سيناريوهات حقيقية وطور مهاراتك',
      icon: '💪',
      link: '/training',
      color: '#f59e0b'
    },
    {
      title: 'الشارت التفاعلي',
      description: 'حمّل بياناتك وطبّق القوانين مباشرة',
      icon: '📊',
      link: '/chart',
      color: '#8b5cf6'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('completed-laws');
    if (saved) {
      setCompletedCount(JSON.parse(saved).length);
    }
  }, []);

  return (
    <div className="home-page">
      <section className="intro">
        <div className="intro-content">
          <p className="intro-eyebrow">مرحبًا بك في النسخة التفاعلية</p>
          <h2 className="intro-title">مقدمة سريعة عن الكتاب</h2>
          <p className="intro-text">
            هذا التطبيق يقدّم قوانين مدرسة قياسات الفوضى التراكمية بصيغة تفاعلية تساعدك على
            القراءة المنظمة، متابعة التقدم، والتطبيق العملي على الشارت.
          </p>
          <p className="intro-text">
            ملاحظة: تم إدراج القوانين كاملة حتى القانون 48، وتشمل أقسام المدرسة والمؤشر والنظام
            الكوني والذكاء الاصطناعي والقوانين المشتركة.
          </p>
        </div>
      </section>
      <section className="hero">
        <p className="hero-overline">لمبتكرها زياد عقيلان</p>
        <h1 className="hero-title">كتاب مدرسة قياسات الفوضى التراكمية</h1>
        <p className="hero-subtitle">
          رحلة تفاعلية شاملة لفهم وتطبيق قوانين المدرسة مع نظام تطبيق عملي على الشارت
        </p>
        <div className="hero-actions">
          <Link href="/learn">
            <a className="btn btn-primary">ابدأ التعلم</a>
          </Link>
          <Link href="/laws">
            <a className="btn btn-secondary">استعرض القوانين</a>
          </Link>
          <a
            className="btn btn-secondary"
            href={prodUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Production Book
          </a>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title text-center">استكشف الكتاب التفاعلي</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link}>
              <a className="feature-card" style={{ '--feature-color': feature.color }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <span className="feature-link">ابدأ الآن ←</span>
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalLaws}</div>
            <div className="stat-label">قوانين</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">أدوات شارت</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">تفاعلي</div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="about-content">
          <h2 className="section-title">تقدمك في الكتاب</h2>
          <p className="about-text">
            أكملت {completedCount} من {totalLaws} قانون
          </p>
          <div className="about-actions">
            <Link href="/learn">
              <a className="btn btn-primary">استمر في التعلم</a>
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        Created By ( Ibrahim H. Al-Sayed & Hegazy H. Al-Sayed ) | Content © 2025 زياد عقيلان
        – Interactive version v1.0
      </footer>
    </div>
  );
};

export default HomePage;
