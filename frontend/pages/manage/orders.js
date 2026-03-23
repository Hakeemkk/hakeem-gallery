import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('normal'); 
  const [selectedOrder, setSelectedOrder] = useState(null);

  // حالات نافذة التفاصيل
  const [editNote, setEditNote] = useState('');
  const [isDepositPaid, setIsDepositPaid] = useState(false);
  const [depositAmount, setDepositAmount] = useState(''); // مبلغ العربون

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const response = await res.json();
      // معالجة آمنة لاستجابة API
      const orders = response.data || response || [];
      const ordersList = Array.isArray(orders) ? orders : [];
      setOrders(ordersList.reverse());
      setLoading(false);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  // تحديث بيانات النافذة لما تفتح أوردر
  useEffect(() => {
    if (selectedOrder) {
      setEditNote(selectedOrder.adminNote || '');
      setIsDepositPaid(selectedOrder.status !== 'جديد' || selectedOrder.depositAmount > 0);
      setDepositAmount(selectedOrder.depositAmount || '');
    }
  }, [selectedOrder]);

  const updateStatusDropdown = async (id, newStatus) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    try {
      await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) { alert("فشل في تحديث الأوردر"); fetchOrders(); }
  };

  const handleSaveAndRoute = async (newStatus) => {
    if (!isDepositPaid && newStatus !== 'جديد') {
      alert("⚠️ يرجى تأكيد استلام العربون أولاً قبل تحويل الأوردر.");
      return;
    }

    const payload = {
      status: newStatus,
      adminNote: editNote,
      depositAmount: Number(depositAmount) || 0 // حفظ مبلغ العربون
    };

    setSelectedOrder(null);

    try {
      console.log('📝 Updating order:', selectedOrder._id, payload);
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }
      
      console.log('✅ Order updated successfully');
      // إعادة جلب البيانات من الخادم للتأكد من التحديث الصحيح
      await fetchOrders();
    } catch (err) {
      console.error('❌ Error updating order:', err);
      alert("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.");
      fetchOrders(); 
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(o => {
      const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || 
                            o.customerPhone.includes(search) || 
                            o._id.slice(-6).toUpperCase().includes(search.toUpperCase());
      if (!matchesSearch) return false;

      switch(activeTab) {
        case 'pending': return o.status === 'جديد';
        case 'production': return ['جاري التصميم', 'في الإنتاج', 'في ورشة الليزر', 'في المطبعة'].includes(o.status);
        case 'shipping': return o.status === 'جاهز للتسليم';
        case 'completed': return o.status === 'تم التسليم';
        default: return true;
      }
    });
  };

  const counts = {
    pending: orders.filter(o => o.status === 'جديد').length,
    production: orders.filter(o => ['جاري التصميم', 'في الإنتاج', 'في ورشة الليزر', 'في المطبعة'].includes(o.status)).length,
    shipping: orders.filter(o => o.status === 'جاهز للتسليم').length,
    completed: orders.filter(o => o.status === 'تم التسليم').length,
    all: orders.length
  };

  const printTicket = (order) => {
    const deposit = order.depositAmount || Number(depositAmount) || 0;
    const remaining = order.totalPrice - deposit;

    const win = window.open('', '_blank');
    win.document.write(`
      <div dir="rtl" style="font-family: Arial; border: 2px dashed #000; padding: 20px; width: 350px; margin: auto;">
        <center><h1 style="margin:0">حكيم جاليري</h1><p>أمر تشغيل وفاتورة</p><h2 style="background:#000; color:#fff; padding:5px;">#${order._id.slice(-6).toUpperCase()}</h2></center>
        <hr/>
        <p><b>العميل:</b> ${order.customerName}</p>
        <p><b>الموبايل:</b> ${order.customerPhone}</p>
        <p><b>المنطقة:</b> ${order.customerGovernorate}</p>
        <hr/>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 10px;">
          <thead><tr style="background:#eee"><th>الصنف</th><th>العدد</th></tr></thead>
          <tbody>
            ${order.items.map(i => `<tr style="border-bottom:1px solid #ddd; padding:5px 0;"><td>${i.title}</td><td align="center"><b>${i.qty}</b></td></tr>`).join('')}
          </tbody>
        </table>
        
        <div style="border: 2px solid #000; padding: 10px; margin-top: 15px; background: #fafafa;">
           <p style="margin: 5px 0;">الإجمالي الكلي: <b>${order.totalPrice} ج.م</b></p>
           <p style="margin: 5px 0;">المدفوع (عربون): <b>${deposit} ج.م</b></p>
           <h3 style="margin: 10px 0 0; border-top: 1px dashed #000; padding-top: 10px;">المطلوب تحصيله: ${remaining} ج.م</h3>
        </div>

        <hr/>
        <p><b>ملاحظات التصنيع:</b><br/> ${editNote || order.adminNote || 'لا يوجد'}</p>
        <center><small>طُبع في: ${new Date().toLocaleString('ar-EG')}</small></center>
      </div>
    `);
    win.document.close(); win.print();
  };

  return (
    <div dir="rtl" className="orders-page">
      <Head><title>إدارة الطلبات | حكيم جاليري</title></Head>

      <header className="o-header">
        <div className="container header-flex">
          <div className="title-area">
            <Link href="/manage" className="back-link">← العودة للوحة القيادة</Link>
            <h1>إدارة الطلبات وتوجيه العمل 📦</h1>
          </div>
          <div className="search-area">
            <input type="text" placeholder="ابحث بكود الأوردر، الاسم، أو الموبايل..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="container">
        <div className="toolbar">
          <div className="tabs-bar">
            <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
              ⏳ انتظار العربون <span className="badge">{counts.pending}</span>
            </button>
            <button className={activeTab === 'production' ? 'active' : ''} onClick={() => setActiveTab('production')}>
              ⚙️ قيد التصنيع <span className="badge warn">{counts.production}</span>
            </button>
            <button className={activeTab === 'shipping' ? 'active' : ''} onClick={() => setActiveTab('shipping')}>
              🚚 للشحن <span className="badge success">{counts.shipping}</span>
            </button>
            <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>
              ✅ تم التسليم <span className="badge grey">{counts.completed}</span>
            </button>
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
              📦 الكل <span className="badge dark">{counts.all}</span>
            </button>
          </div>

          <div className="view-controls">
            <button className={viewMode === 'compact' ? 'active' : ''} onClick={() => setViewMode('compact')} title="عرض مكثف">📱</button>
            <button className={viewMode === 'normal' ? 'active' : ''} onClick={() => setViewMode('normal')} title="عرض افتراضي">💻</button>
            <button className={viewMode === 'large' ? 'active' : ''} onClick={() => setViewMode('large')} title="عرض كبير">🖥️</button>
          </div>
        </div>

        <div className={`orders-grid ${viewMode}`}>
          {loading ? <div className="msg">جاري تحميل الأوردرات...</div> : 
           getFilteredOrders().length === 0 ? <div className="msg">لا توجد أوردرات هنا حالياً.</div> :
           getFilteredOrders().map(order => (
            <div key={order._id} className={`order-card status-${order.status.replace(/\s+/g, '-')}`} onClick={() => setSelectedOrder(order)}>
              <div className="card-top">
                <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                <span className="status-indicator">{order.status}</span>
              </div>
              <div className="card-body">
                <h3>{order.customerName}</h3>
                <p>📍 {order.customerGovernorate}</p>
                <div className="item-summary">{order.items.length} أصناف </div>
                {order.depositAmount > 0 && <div className="deposit-tag">عربون مدفوع: {order.depositAmount} ج</div>}
              </div>
              <div className="card-foot" onClick={e => e.stopPropagation()}>
                 <b>{order.totalPrice - (order.depositAmount || 0)} ج.م <small>باقي</small></b>
                 <select className="quick-select" value={order.status} onChange={e => updateStatusDropdown(order._id, e.target.value)}>
                   <option value="جديد">جديد</option>
                   <option value="في ورشة الليزر">ليزر</option>
                   <option value="في المطبعة">طباعة</option>
                   <option value="جاهز للتسليم">شحن</option>
                   <option value="تم التسليم">مكتمل</option>
                 </select>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 🚀 نافذة التفاصيل الشاملة */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تجهيز الأوردر <span className="gold">#{selectedOrder._id.slice(-6).toUpperCase()}</span></h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="order-data">
                <div className="info-block flex-info">
                  <div className="client-text">
                    <h3>👤 بيانات العميل</h3>
                    <p><b>الاسم:</b> {selectedOrder.customerName}</p>
                    <p><b>العنوان:</b> {selectedOrder.customerGovernorate} - {selectedOrder.customerAddress}</p>
                  </div>
                  <div className="client-contact">
                    <a href={`https://wa.me/2${selectedOrder.customerPhone.replace(/\D/g,'')}`} target="_blank" className="wa-btn-big">
                      💬 تواصل واتساب<br/><small>{selectedOrder.customerPhone}</small>
                    </a>
                  </div>
                </div>

                <div className="info-block">
                  <h3>🛒 الأصناف المطلوبة</h3>
                  <div className="items-tags">
                    {selectedOrder.items.map((it, idx) => (
                      <span key={idx} className="i-tag">{it.title} <b>(x{it.qty})</b></span>
                    ))}
                  </div>
                </div>

                <div className="info-block">
                  <h3>📝 تفاصيل التصنيع المطلوبة للورشة</h3>
                  <textarea 
                    className="note-input" 
                    placeholder="اكتب هنا أي تفاصيل اتفق عليها العميل..."
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="order-actions-panel">
                
                {/* 🔥 النظام المحاسبي للعربون */}
                <div className={`deposit-container ${isDepositPaid ? 'paid' : ''}`}>
                  <label className="deposit-box">
                    <input 
                      type="checkbox" 
                      checked={isDepositPaid} 
                      onChange={e => setIsDepositPaid(e.target.checked)} 
                    />
                    <div className="dep-text">
                      <h4>تأكيد استلام العربون 💰</h4>
                      <p>مطلوب لتحويل الأوردر.</p>
                    </div>
                  </label>
                  
                  {isDepositPaid && (
                    <div className="deposit-calc">
                      <div className="input-group">
                        <label>المبلغ المدفوع (عربون):</label>
                        <input 
                          type="number" 
                          placeholder="مثال: 50" 
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                        />
                      </div>
                      <div className="calc-result">
                        الباقي للتحصيل: <b>{selectedOrder.totalPrice - (Number(depositAmount) || 0)} ج.م</b>
                      </div>
                    </div>
                  )}
                </div>

                <h3>توجيه الأوردر للإنتاج 🏭</h3>
                <div className="routing-buttons">
                  <button className="route-btn laser" disabled={!isDepositPaid} onClick={() => handleSaveAndRoute('في ورشة الليزر')}>
                    {!isDepositPaid ? '🔒' : '✂️'} إرسال لورشة الليزر
                  </button>
                  <button className="route-btn print" disabled={!isDepositPaid} onClick={() => handleSaveAndRoute('في المطبعة')}>
                    {!isDepositPaid ? '🔒' : '🖨️'} إرسال للمطبعة
                  </button>
                  <button className="route-btn direct" disabled={!isDepositPaid} onClick={() => handleSaveAndRoute('جاهز للتسليم')}>
                    {!isDepositPaid ? '🔒' : '📦'} شحن مباشر
                  </button>
                  <div className="divider">أو</div>
                  <button className="route-btn save-only" onClick={() => handleSaveAndRoute(selectedOrder.status)}>
                    💾 حفظ البيانات (تحديث)
                  </button>
                </div>

                <div className="extra-actions">
                  <button onClick={() => printTicket(selectedOrder)}>🖨️ طباعة الفاتورة / البون</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-page { background: #f8fafc; min-height: 100vh; font-family: 'Tajawal', sans-serif; padding-bottom: 50px; color: #1e293b; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 25px; }
        .gold { color: #d4af37; }

        .o-header { background: #fff; padding: 25px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .header-flex { display: flex; justify-content: space-between; align-items: center; }
        .title-area h1 { margin: 10px 0 0; font-size: 24px; color: #111; }
        .back-link { color: #64748b; text-decoration: none; font-size: 13px; font-weight: bold; }
        .search-area input { width: 350px; padding: 14px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f1f5f9; outline: none; font-family: inherit; }

        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
        .tabs-bar { display: flex; gap: 10px; overflow-x: auto; }
        .tabs-bar button { background: #fff; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit; color: #475569; }
        .tabs-bar button.active { background: #1e293b; color: #d4af37; border-color: #1e293b; }
        
        .badge { background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 50px; font-size: 11px; }
        .badge.warn { background: #f59e0b; color: #fff; }
        .badge.success { background: #10b981; color: #fff; }
        .badge.dark { background: #000; color: #d4af37; }

        .view-controls { display: flex; gap: 5px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 5px; }
        .view-controls button { background: transparent; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 16px; }
        .view-controls button.active { background: #f1f5f9; }

        .orders-grid { display: grid; gap: 20px; }
        .orders-grid.compact { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        .orders-grid.normal { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
        .orders-grid.large { grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); }

        .order-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; border-right: 6px solid #cbd5e1; cursor: pointer; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .status-جديد { border-right-color: #3b82f6; }
        .status-في-ورشة-الليزر, .status-في-المطبعة, .status-في-الإنتاج, .status-جاري-التصميم { border-right-color: #f59e0b; }
        .status-جاهز-للتسليم { border-right-color: #10b981; }

        .card-top { padding: 15px; display: flex; justify-content: space-between; align-items: center; background: #fafbfc; border-bottom: 1px solid #f8fafc; }
        .order-id { font-weight: 900; color: #475569; }
        .status-indicator { font-size: 10px; font-weight: bold; background: #fff; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 50px; }

        .card-body { padding: 15px; flex: 1; }
        .card-body h3 { margin: 0 0 5px; font-size: 16px; }
        .card-body p { margin: 0 0 10px; font-size: 12px; color: #64748b; }
        .item-summary { background: #f1f5f9; display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        .deposit-tag { margin-top: 10px; font-size: 11px; background: #ecfdf5; color: #059669; display: inline-block; padding: 4px 8px; border-radius: 5px; border: 1px solid #6ee7b7; font-weight: bold; }

        .card-foot { padding: 15px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .card-foot b { color: #1e293b; font-size: 16px; }
        .card-foot small { font-size: 10px; color: #94a3b8; }
        .quick-select { padding: 5px; border-radius: 5px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; font-size: 12px; outline: none; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); z-index: 5000; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .detail-modal { background: #fff; width: 100%; max-width: 1000px; border-radius: 25px; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 25px 50px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .modal-header { padding: 20px 30px; background: #1e293b; color: #fff; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; }
        .close-btn { background: rgba(255,255,255,0.1); border: none; color: #fff; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 16px; }

        .modal-body { display: flex; flex-wrap: wrap; overflow-y: auto; }
        .order-data { flex: 1.5; padding: 30px; min-width: 350px; border-right: 1px solid #e2e8f0; }
        .order-actions-panel { flex: 1; padding: 30px; background: #f8fafc; min-width: 300px; }

        .info-block { margin-bottom: 25px; }
        .info-block h3 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; color: #334155; font-size: 16px; }
        
        .flex-info { display: flex; justify-content: space-between; gap: 20px; }
        .client-text p { margin: 8px 0; font-size: 14px; color: #475569; }
        .wa-btn-big { background: #25D366; color: #fff; text-decoration: none; padding: 15px 20px; border-radius: 15px; text-align: center; display: block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); }

        .items-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .i-tag { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 10px; font-size: 14px; }
        .i-tag b { color: #3b82f6; }

        .note-input { width: 100%; min-height: 120px; padding: 15px; border-radius: 15px; border: 2px solid #e2e8f0; font-family: inherit; font-size: 14px; outline: none; transition: 0.3s; resize: vertical; background: #fafbfc; line-height: 1.6; }
        .note-input:focus { border-color: #d4af37; background: #fff; box-shadow: 0 0 0 4px rgba(212,175,55,0.1); }

        /* 🔥 تصميم النظام المحاسبي للعربون */
        .deposit-container { background: #fef2f2; border: 2px solid #fecaca; border-radius: 15px; margin-bottom: 30px; transition: 0.3s; overflow: hidden; }
        .deposit-container.paid { background: #ecfdf5; border-color: #6ee7b7; }
        
        .deposit-box { padding: 15px 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; }
        .deposit-box input { width: 25px; height: 25px; cursor: pointer; accent-color: #10b981; }
        .dep-text h4 { margin: 0 0 5px; font-size: 16px; color: #1e293b; }
        .dep-text p { margin: 0; font-size: 12px; color: #64748b; }

        .deposit-calc { border-top: 1px dashed #6ee7b7; padding: 15px 20px; background: rgba(255,255,255,0.5); }
        .input-group label { display: block; font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 5px; }
        .input-group input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #a7f3d0; outline: none; font-family: inherit; font-weight: bold; color: #047857; }
        .calc-result { margin-top: 15px; background: #059669; color: #fff; padding: 10px; border-radius: 8px; text-align: center; font-size: 14px; }
        .calc-result b { font-size: 18px; display: inline-block; margin-right: 5px; }

        .routing-buttons { display: flex; flex-direction: column; gap: 12px; }
        .route-btn { padding: 15px; border: none; border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; text-align: right; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .route-btn:disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed; }
        .route-btn:not(:disabled):hover { transform: translateX(-5px); }
        
        .route-btn.laser { background: #fff; border: 1px solid #f59e0b; color: #d97706; }
        .route-btn.print { background: #fff; border: 1px solid #8b5cf6; color: #7c3aed; }
        .route-btn.direct { background: #fff; border: 1px solid #3b82f6; color: #2563eb; }
        .route-btn.save-only { background: #1e293b; color: #d4af37; border: none; text-align: center; }
        .divider { text-align: center; color: #94a3b8; font-size: 12px; margin: 5px 0; }

        .extra-actions { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .extra-actions button { width: 100%; padding: 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; cursor: pointer; font-family: inherit; font-weight: bold; }

        .msg { text-align: center; padding: 100px; color: #64748b; font-size: 18px; }

        @media (max-width: 900px) {
          .header-flex, .toolbar { flex-direction: column; gap: 15px; align-items: stretch; }
          .modal-body { flex-direction: column; }
          .order-data, .order-actions-panel { border-right: none; border-bottom: 1px solid #e2e8f0; }
          .flex-info { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}