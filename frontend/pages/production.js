import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function FactoryFloor() {
  const [activeTab, setActiveTab] = useState('design');
  const [orders, setOrders] = useState([]);
  const [theme, setTheme] = useState('dark');
  
  const [designModal, setDesignModal] = useState({ isOpen: false, orderId: null });
  const [designData, setDesignData] = useState({ department: 'laser', notes: '' });
  const [designFile, setDesignFile] = useState(null); // تخزين الملف هنا
  const [isUploading, setIsUploading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      setOrders(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('factory-theme') || 'dark';
    setTheme(savedTheme);
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); 
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('factory-theme', newTheme);
  };

  const updateOrder = async (id, updateFields) => {
    await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateFields)
    });
    fetchOrders();
  };

  const finishProduction = (id) => updateOrder(id, { status: 'جاهز للتسليم' });

  const submitDesign = async (e) => {
    e.preventDefault();
    if (!designFile) return alert('الرجاء اختيار ملف التصميم (CDR, PDF, إلخ) أولاً!');
    
    setIsUploading(true);
    
    // 1. إرسال الملف للسيرفر
    const formData = new FormData();
    formData.append('designFile', designFile);
    
    try {
      const uploadRes = await fetch('http://localhost:5000/api/orders/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      // 2. ربط رابط الملف الجديد بالأوردر وتحويله للورشة
      await updateOrder(designModal.orderId, {
        status: 'في الإنتاج', 
        department: designData.department, 
        designLink: uploadData.fileUrl, 
        adminNote: designData.notes
      });
      
      setDesignModal({ isOpen: false, orderId: null });
      setDesignData({ department: 'laser', notes: '' });
      setDesignFile(null);
    } catch (err) {
      alert("❌ حدث خطأ أثناء رفع الملف");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const printWorkTicket = (o) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl"><head><title>أمر تشغيل - ${o._id.slice(-5)}</title>
      <style>
        body { font-family: Tahoma; padding: 20px; text-align: center; }
        .ticket { border: 3px solid #000; padding: 20px; max-width: 350px; margin: auto; border-radius: 10px; }
        .dept { font-size: 24px; font-weight: bold; background: #000; color: #fff; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        ul { text-align: right; font-size: 18px; line-height: 1.6; }
      </style></head>
      <body>
        <div class="ticket">
          <div class="dept">${o.department === 'laser' ? '✂️ قسم الليزر' : '🖨️ المطبعة'}</div>
          <h2>أوردر #${o._id.slice(-5)}</h2><hr/>
          <ul>${o.items.map(i => `<li>${i.title} (الكمية: <strong>${i.qty}</strong>)</li>`).join('')}</ul><hr/>
          <p style="text-align:right"><strong>ملاحظات:</strong> ${o.adminNote || 'لا يوجد'}</p>
        </div>
        <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const designOrders = orders.filter(o => o.status === 'جاري التصميم');
  const laserOrders = orders.filter(o => o.status === 'في الإنتاج' && o.department === 'laser');
  const printOrders = orders.filter(o => o.status === 'في الإنتاج' && o.department === 'print');

  return (
    <div dir="rtl" className={`factory-wrapper ${theme}`}>
      <Head><title>شاشة المصنع | حكيم جاليري</title></Head>

      <nav className="factory-nav">
        <div className="brand">🏭 خطوط الإنتاج</div>
        <div className="nav-buttons">
          <button className={activeTab === 'design' ? 'active' : ''} onClick={() => setActiveTab('design')}>🎨 التصميم ({designOrders.length})</button>
          <button className={activeTab === 'laser' ? 'active' : ''} onClick={() => setActiveTab('laser')}>⚙️ الليزر ({laserOrders.length})</button>
          <button className={activeTab === 'print' ? 'active' : ''} onClick={() => setActiveTab('print')}>🖨️ المطبعة ({printOrders.length})</button>
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link href="/manage" className="back-btn">العودة للإدارة ↗</Link>
        </div>
      </nav>

      <main className="factory-workspace">
        {activeTab === 'design' && (
          <div className="production-grid">
            {designOrders.length === 0 && <p className="empty">لا يوجد تصميمات مطلوبة ☕</p>}
            {designOrders.map(o => (
              <div key={o._id} className="job-card design-card">
                <div className="job-header">أوردر #{o._id.slice(-5)} <span className="c-name">({o.customerName})</span></div>
                <ul className="items-list">{o.items.map((i, idx) => <li key={idx}>{i.title} (x{i.qty})</li>)}</ul>
                <button className="btn-primary" onClick={() => setDesignModal({ isOpen: true, orderId: o._id })}>📤 رفع التصميم (ملف)</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'laser' && (
          <div className="production-grid">
            {laserOrders.length === 0 && <p className="empty">الليزر متوقف 💤</p>}
            {laserOrders.map(o => (
              <div key={o._id} className="job-card laser-card">
                <div className="job-header">أوردر #{o._id.slice(-5)}</div>
                <div className="instructions"><strong>ملاحظات:</strong> {o.adminNote}</div>
                <div className="action-row">
                  <a href={o.designLink} target="_blank" download className="btn-secondary">⬇️ تحميل الملف للقص</a>
                  <button className="btn-secondary" onClick={() => printWorkTicket(o)}>🖨️ التيكت</button>
                </div>
                <button className="btn-success" onClick={() => finishProduction(o._id)}>✅ تم القص بنجاح</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'print' && (
          <div className="production-grid">
            {printOrders.length === 0 && <p className="empty">المطبعة متوقفة 💤</p>}
            {printOrders.map(o => (
              <div key={o._id} className="job-card print-card">
                <div className="job-header">أوردر #{o._id.slice(-5)}</div>
                <div className="instructions"><strong>الطباعة:</strong> {o.adminNote}</div>
                <div className="action-row">
                  <a href={o.designLink} target="_blank" download className="btn-secondary">⬇️ تحميل ملف الطباعة</a>
                  <button className="btn-secondary" onClick={() => printWorkTicket(o)}>🖨️ التيكت</button>
                </div>
                <button className="btn-success" onClick={() => finishProduction(o._id)}>✅ تمت الطباعة بنجاح</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {designModal.isOpen && (
        <div className="modal-bg">
          <div className="modal">
            <h3>رفع ملف التصميم 🏭</h3>
            <form onSubmit={submitDesign}>
              
              <label className="file-label">
                اختر ملف التصميم (CDR, PDF, AI, JPG):
                <input type="file" required onChange={e => setDesignFile(e.target.files[0])} />
              </label>

              <select value={designData.department} onChange={e => setDesignData({...designData, department: e.target.value})}>
                <option value="laser">ورشة الليزر ⚙️</option>
                <option value="print">المطبعة 🖨️</option>
              </select>
              
              <textarea rows="3" required placeholder="ملاحظات المكنجي (المقاسات والخامات)..." value={designData.notes} onChange={e => setDesignData({...designData, notes: e.target.value})}></textarea>
              
              <div className="action-row">
                <button type="submit" className="btn-primary" style={{flex: 2}} disabled={isUploading}>
                  {isUploading ? '⏳ جاري الرفع...' : 'إرسال للمكنة 🚀'}
                </button>
                <button type="button" className="btn-danger" onClick={() => setDesignModal({isOpen:false})} style={{flex: 1}} disabled={isUploading}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .factory-wrapper.dark { --bg: #121212; --surface: #1e1e1e; --text: #ffffff; --text-muted: #aaa; --border: #333; --accent: #f39c12; --nav: #1a1a1a; }
        .factory-wrapper.light { --bg: #f0f2f5; --surface: #ffffff; --text: #1a1a1a; --text-muted: #555; --border: #ddd; --accent: #d4af37; --nav: #ffffff; }
        .factory-wrapper { background: var(--bg); min-height: 100vh; color: var(--text); font-family: 'Tajawal', sans-serif; transition: 0.3s; }
        .factory-nav { background: var(--nav); padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); transition: 0.3s; }
        .brand { font-size: 24px; font-weight: 900; color: var(--accent); }
        .nav-buttons { display: flex; gap: 10px; }
        .nav-buttons button { background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 10px 20px; font-size: 15px; border-radius: 12px; cursor: pointer; font-family: inherit; transition: 0.3s; font-weight: bold; }
        .nav-buttons button:hover { border-color: var(--accent); }
        .nav-buttons button.active { background: var(--accent); color: #000; border-color: var(--accent); }
        .nav-actions { display: flex; gap: 15px; align-items: center; }
        .theme-toggle { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 12px; cursor: pointer; font-size: 18px; transition: 0.3s; }
        .back-btn { border: 1px solid var(--border); color: var(--text); padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: bold; transition: 0.3s; }
        .back-btn:hover { background: var(--border); }
        .factory-workspace { padding: 40px; }
        .production-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .empty { grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 20px; margin-top: 50px; font-weight: bold; }
        .job-card { background: var(--surface); border-radius: 16px; padding: 25px; border-top: 6px solid #555; box-shadow: 0 8px 25px rgba(0,0,0,0.05); transition: 0.3s; border-left: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .job-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        .design-card { border-top-color: #3498db; } .laser-card { border-top-color: #e67e22; } .print-card { border-top-color: #9b59b6; }
        .job-header { font-size: 20px; font-weight: 900; margin-bottom: 20px; border-bottom: 1px dashed var(--border); padding-bottom: 15px; }
        .c-name { font-size: 14px; color: var(--text-muted); font-weight: normal; }
        .items-list { list-style: none; padding: 0; margin: 0 0 20px; color: var(--text); line-height: 1.8; font-size: 15px; }
        .instructions { background: rgba(241, 196, 15, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; color: #d4af37; border: 1px dashed #d4af37; font-size: 15px; line-height: 1.6; }
        .action-row { display: flex; gap: 12px; margin-bottom: 15px; }
        .btn-primary { width: 100%; background: #3498db; color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 16px; transition: 0.3s; }
        .btn-primary:hover:not(:disabled) { background: #2980b9; transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { flex: 1; background: var(--bg); color: var(--text); text-align: center; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; border: 1px solid var(--border); cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn-secondary:hover { border-color: var(--accent); }
        .btn-success { width: 100%; background: #2ecc71; color: #fff; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: inherit; font-size: 16px; transition: 0.3s; }
        .btn-success:hover { background: #27ae60; transform: translateY(-2px); }
        .btn-danger { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn-danger:hover:not(:disabled) { background: #e74c3c; color: #fff; }
        .modal-bg { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
        .modal { background: var(--surface); color: var(--text); padding: 35px; border-radius: 20px; width: 90%; max-width: 450px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border: 1px solid var(--border); }
        .modal h3 { margin-top: 0; border-bottom: 2px solid var(--accent); padding-bottom: 15px; margin-bottom: 25px; }
        .file-label { display: block; margin-bottom: 15px; font-weight: bold; color: var(--text); }
        .modal input[type="file"] { width: 100%; padding: 10px; margin-top: 5px; border: 1px dashed var(--border); border-radius: 8px; background: var(--bg); color: var(--text); }
        .modal select, .modal textarea { width: 100%; padding: 15px; margin-bottom: 20px; border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 10px; font-family: inherit; box-sizing: border-box; outline: none; transition: 0.3s; }
        .modal select:focus, .modal textarea:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}