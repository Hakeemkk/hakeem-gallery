import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function PremiumAdminPortal() {
  const [stats, setStats] = useState({ total: 0, pending: 0, workshop: 0, shipping: 0, completed: 0 });
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // استرجاع الثيم المحفوظ
    const savedTheme = localStorage.getItem('hakeem-theme') || 'light';
    setTheme(savedTheme);

    // جلب الإحصائيات الشاملة
    api.get('/orders')
      .then(data => {
        // معالجة آمنة لاستجابة API
        const orders = data.data || data || [];
        const ordersList = Array.isArray(orders) ? orders : [];
        
        setStats({
          total: ordersList.length,
          pending: ordersList.filter(o => o.status === 'جديد').length,
          workshop: ordersList.filter(o => ['جاري التصميم', 'في الإنتاج', 'في ورشة الليزر', 'في المطبعة'].includes(o.status)).length,
          shipping: ordersList.filter(o => o.status === 'جاهز للتسليم').length,
          completed: ordersList.filter(o => o.status === 'تم التسليم').length,
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setIsLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('hakeem-theme', newTheme);
  };

  return (
    <div dir="rtl" className={`portal-wrapper ${theme}`}>
      <Head><title>مركز القيادة | حكيم جاليري</title></Head>

      {/* خلفية جمالية */}
      <div className="bg-glow shape-1"></div>
      <div className="bg-glow shape-2"></div>

      <div className="portal-content">
        {/* 🚀 Header */}
        <header className="portal-header">
          <div className="brand-zone">
            <div className="logo-box">
              <img src="/logo.png" alt="Hakeem Gallery" />
            </div>
            <div className="brand-titles">
              <h1>مركز القيادة</h1>
              <p>نظام إدارة الموارد المتكامل (ERP)</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 الوضع الداكن' : '☀️ الوضع المضيء'}
            </button>
            <Link href="/" className="exit-btn">العودة للمتجر 🌐</Link>
          </div>
        </header>

        <main>
          {/* 👋 Welcome Banner */}
          <div className="welcome-banner">
            <div className="banner-text">
              <h2>مرحباً بك في لوحة تحكم حكيم جاليري! 👑</h2>
              <p>من هنا تقدر تدير المصنع بالكامل، تتابع الأوردرات من لحظة استلامها لحد ما تتسلم للعميل، وتتحكم في الخامات.</p>
            </div>
            <div className="quick-stats">
              <div className="stat-pill">
                <span>إجمالي الطلبات</span>
                <b>{isLoading ? '...' : stats.total}</b>
              </div>
              <div className="stat-pill highlight">
                <span>أرباح محصلة</span>
                <b>💰</b>
              </div>
            </div>
          </div>

          {/* 🍱 Bento Grid Layout */}
          <div className="bento-grid">
            
            {/* 1. Orders Card (Large: Spans 2 rows and 2 cols) */}
            <Link href="/manage/orders" className="bento-card orders-card">
              <div className="card-bg-icon">📦</div>
              <div className="card-icon blue-glow">🛒</div>
              <div className="card-info">
                <h3>إدارة الطلبات والتوجيه</h3>
                <p>مراجعة الطلبات الجديدة، التأكد من العربون، وتوجيه الأوردرات لخطوط الإنتاج (الورشة أو الشحن).</p>
              </div>
              <div className="card-badges">
                <span className="badge-warn">⏳ {stats.pending} بانتظار التأكيد</span>
                <span className="badge-dark">📦 {stats.total} إجمالي الأوردرات</span>
              </div>
            </Link>

            {/* 2. Workshop Card */}
            <Link href="/manage/workshop" className="bento-card workshop-card">
              <div className="card-icon orange-glow">⚙️</div>
              <div className="card-info">
                <h3>شاشة الورشة والمطبعة</h3>
                <p>قسم الفنيين والإنتاج.</p>
              </div>
              <div className="card-badges">
                <span className="badge-orange">🔥 {stats.workshop} جاري تصنيعه</span>
              </div>
            </Link>

            {/* 3. Shipping Card */}
            <Link href="/manage/shipping" className="bento-card shipping-card">
              <div className="card-icon cyan-glow">🚚</div>
              <div className="card-info">
                <h3>التغليف والشحن</h3>
                <p>تجهيز البوالص ومتابعة المناديب.</p>
              </div>
              <div className="card-badges">
                <span className="badge-cyan">📦 {stats.shipping} جاهز للتسليم</span>
              </div>
            </Link>

            {/* 4. Products Card */}
            <Link href="/manage/products" className="bento-card products-card">
              <div className="card-icon gold-glow">🏷️</div>
              <div className="card-info">
                <h3>المنتجات والأسعار</h3>
                <p>إضافة أعمال وتعديل أسعار الجملة.</p>
              </div>
            </Link>

            {/* 5. Inventory Card */}
            <Link href="/manage/inventory" className="bento-card inventory-card">
              <div className="card-icon green-glow">🗄️</div>
              <div className="card-info">
                <h3>المخزن والخامات</h3>
                <p>جرد ونواقص الأكريليك والأخشاب.</p>
              </div>
            </Link>

            {/* 6. Customers Card */}
            <Link href="/manage/customers" className="bento-card customers-card">
              <div className="card-icon purple-glow">👥</div>
              <div className="card-info">
                <h3>قاعدة العملاء</h3>
                <p>داتا العملاء وتصنيف عملاء الـ VIP.</p>
              </div>
            </Link>

          </div>
        </main>
      </div>

      <style jsx>{`
        /* 🎨 THEME VARIABLES */
        .portal-wrapper.light {
          --bg-base: #f8fafc;
          --bg-card: rgba(255, 255, 255, 0.85);
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border-color: rgba(0, 0, 0, 0.05);
          --shadow-color: rgba(0, 0, 0, 0.05);
          --gold-accent: #d4af37;
          --glass-blur: blur(20px);
        }

        .portal-wrapper.dark {
          --bg-base: #0f172a;
          --bg-card: rgba(30, 41, 59, 0.7);
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --border-color: rgba(255, 255, 255, 0.1);
          --shadow-color: rgba(0, 0, 0, 0.3);
          --gold-accent: #f1c40f;
          --glass-blur: blur(20px);
        }

        /* 🌌 CORE STYLES */
        .portal-wrapper { background: var(--bg-base); min-height: 100vh; font-family: 'Tajawal', sans-serif; color: var(--text-main); position: relative; overflow: hidden; transition: background 0.4s ease; padding-bottom: 50px; }
        
        .bg-glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; z-index: 0; pointer-events: none; }
        .shape-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: radial-gradient(circle, var(--gold-accent) 0%, transparent 70%); }
        .shape-2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); opacity: 0.2; }

        .portal-content { position: relative; z-index: 1; max-width: 1250px; margin: 0 auto; padding: 40px 20px; }

        /* 🚀 HEADER */
        .portal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: var(--bg-card); backdrop-filter: var(--glass-blur); padding: 20px 30px; border-radius: 25px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px var(--shadow-color); }
        .brand-zone { display: flex; align-items: center; gap: 20px; }
        .logo-box { background: var(--text-main); padding: 10px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .logo-box img { height: 45px; object-fit: contain; }
        .brand-titles h1 { margin: 0; font-size: 24px; font-weight: 900; color: var(--text-main); }
        .brand-titles p { margin: 5px 0 0; font-size: 13px; color: var(--text-muted); }
        
        .header-actions { display: flex; gap: 15px; }
        .theme-btn, .exit-btn { padding: 12px 25px; border-radius: 12px; font-weight: bold; font-family: inherit; cursor: pointer; transition: 0.3s; font-size: 14px; text-decoration: none; display: flex; align-items: center; }
        .theme-btn { background: transparent; border: 2px solid var(--border-color); color: var(--text-main); }
        .theme-btn:hover { border-color: var(--gold-accent); }
        .exit-btn { background: var(--text-main); color: var(--bg-base); border: none; }
        .exit-btn:hover { background: var(--gold-accent); color: #111; transform: scale(1.05); }

        /* 👋 WELCOME BANNER */
        .welcome-banner { background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%); border: 1px solid rgba(212, 175, 55, 0.2); padding: 40px; border-radius: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; gap: 30px; backdrop-filter: var(--glass-blur); }
        .banner-text h2 { margin: 0 0 10px; font-size: 28px; }
        .banner-text p { margin: 0; color: var(--text-muted); font-size: 16px; line-height: 1.6; max-width: 600px; }
        .quick-stats { display: flex; gap: 15px; }
        .stat-pill { background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px 25px; border-radius: 20px; text-align: center; box-shadow: 0 5px 15px var(--shadow-color); }
        .stat-pill span { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
        .stat-pill b { font-size: 24px; color: var(--text-main); }
        .stat-pill.highlight b { color: #f59e0b; font-size: 28px; }

        /* 🍱 BENTO GRID */
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: minmax(180px, auto); gap: 25px; }
        
        .bento-card { background: var(--bg-card); backdrop-filter: var(--glass-blur); border: 1px solid var(--border-color); border-radius: 30px; padding: 35px; text-decoration: none; color: inherit; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start; box-shadow: 0 10px 30px var(--shadow-color); }
        .bento-card:hover { transform: translateY(-8px); border-color: var(--gold-accent); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        .card-icon { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; background: var(--bg-base); border: 1px solid var(--border-color); }
        .blue-glow { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
        .orange-glow { box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
        .cyan-glow { box-shadow: 0 0 20px rgba(6, 182, 212, 0.2); }
        .gold-glow { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
        .green-glow { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
        .purple-glow { box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }

        .card-info h3 { margin: 0 0 8px; font-size: 20px; color: var(--text-main); font-weight: bold; }
        .card-info p { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; }

        /* Custom Sizing for Bento Grid */
        .orders-card { grid-column: span 2; grid-row: span 2; justify-content: center; background: linear-gradient(180deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%); }
        .orders-card h3 { font-size: 28px; }
        .orders-card p { font-size: 15px; max-width: 85%; }
        .card-bg-icon { position: absolute; left: -20px; bottom: -40px; font-size: 250px; opacity: 0.03; pointer-events: none; transform: rotate(-15deg); }
        
        .card-badges { display: flex; gap: 8px; margin-top: auto; padding-top: 20px; flex-wrap: wrap; }
        .card-badges span { padding: 6px 15px; border-radius: 10px; font-size: 12px; font-weight: bold; }
        
        .badge-warn { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-dark { background: rgba(15, 23, 42, 0.1); color: var(--text-main); border: 1px solid var(--border-color); }
        .badge-orange { background: rgba(245, 158, 11, 0.15); color: #d97706; }
        .badge-cyan { background: rgba(6, 182, 212, 0.15); color: #0891b2; }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr; }
          .orders-card { grid-column: span 1; grid-row: span 1; }
          .welcome-banner { flex-direction: column; text-align: center; }
          .portal-header { flex-direction: column; gap: 20px; text-align: center; }
        }
      `}</style>
    </div>
  );
}