import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ShippingManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchShippingOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      // فلترة اللي جاهز للشحن فقط
      const shippingOrders = data.reverse().filter(o => o.status === 'جاهز للتسليم');
      setOrders(shippingOrders);
      setLoading(false);
    } catch (err) { console.error("Error:", err); }
  };

  useEffect(() => {
    fetchShippingOrders();
  }, []);

  const markAsDelivered = async (id) => {
    if (confirm('تأكيد تسليم الأوردر للعميل واستلام النقدية؟')) {
      try {
        await fetch(`http://localhost:5000/api/orders/${id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'تم التسليم' })
        });
        fetchShippingOrders(); // هيختفي ويروح الأرشيف
      } catch (err) { alert("خطأ في التحديث"); }
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerGovernorate.includes(search) || 
    o.customerName.includes(search) || 
    o._id.includes(search)
  );

  return (
    <div dir="rtl" className="shipping-page">
      <Head><title>إدارة الشحن | حكيم جاليري</title></Head>

      <header className="ship-header">
        <div className="container header-flex">
          <div className="title-area">
            <Link href="/manage" className="back-link">← العودة للداشبورد</Link>
            <h1>إدارة التغليف والشحن 🚚</h1>
          </div>
          <div className="search-box">
             <input type="text" placeholder="ابحث بالمحافظة أو العميل..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="container">
        <div className="stats-row">
           <div className="stat-card">
              <span>إجمالي الشحنات</span>
              <b>{orders.length}</b>
           </div>
           <div className="stat-card gold-card">
              <span>النقدية المتوقع تحصيلها</span>
              <b>{orders.reduce((sum, o) => sum + o.totalPrice, 0)} ج.م</b>
           </div>
        </div>

        <div className="shipping-grid">
          {loading ? <div className="msg">جاري تحضير بوالص الشحن...</div> : 
           filteredOrders.length === 0 ? <div className="msg">لا توجد شحنات معلقة حالياً.</div> :
           filteredOrders.map(order => (
            <div key={order._id} className="ship-card">
              <div className="card-top">
                <span className="gov-tag">{order.customerGovernorate}</span>
                <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
              </div>
              
              <div className="card-body">
                <h3>{order.customerName}</h3>
                <div className="address-box">
                  <p>📍 <b>العنوان:</b> {order.customerAddress}</p>
                </div>
                
                <div className="contact-box">
                  <span>📞 {order.customerPhone}</span>
                  <a href={`https://wa.me/2${order.customerPhone.replace(/\D/g,'')}`} target="_blank" className="wa-btn">مراسلة 💬</a>
                </div>

                <div className="items-summary">
                  <b>المحتويات:</b> {order.items.map(i => `${i.title} (x${i.qty})`).join('، ')}
                </div>
              </div>

              <div className="card-foot">
                <div className="amount-to-collect">
                  المطلوب تحصيله: <br/><b>{order.totalPrice} ج.م</b>
                </div>
                <button className="deliver-btn" onClick={() => markAsDelivered(order._id)}>
                  تم التوصيل بنجاح ✅
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .shipping-page { background: #f8fafc; min-height: 100vh; font-family: 'Tajawal', sans-serif; color: #1e293b; padding-bottom: 50px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 25px; }

        .ship-header { background: #fff; padding: 25px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .header-flex { display: flex; justify-content: space-between; align-items: center; }
        .title-area h1 { margin: 10px 0 0; font-size: 26px; color: #111; }
        .back-link { color: #64748b; text-decoration: none; font-size: 13px; font-weight: bold; }
        .search-box input { width: 350px; padding: 14px 20px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-family: inherit; background: #f1f5f9; }

        .stats-row { display: flex; gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #fff; flex: 1; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .stat-card span { display: block; color: #64748b; font-size: 14px; margin-bottom: 10px; }
        .stat-card b { font-size: 30px; color: #1e293b; }
        .gold-card { background: #fffdf5; border-color: #fde047; }
        .gold-card b { color: #d4af37; }

        .shipping-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
        .ship-card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; border-right: 6px solid #3b82f6; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 5px 15px rgba(0,0,0,0.04); transition: 0.3s; }
        .ship-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }

        .card-top { padding: 15px 20px; background: #f1f5f9; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
        .gov-tag { background: #3b82f6; color: #fff; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; }
        .order-id { font-weight: 900; color: #64748b; letter-spacing: 1px; }

        .card-body { padding: 25px 20px; flex: 1; }
        .card-body h3 { margin: 0 0 15px; font-size: 20px; color: #0f172a; }
        
        .address-box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
        .address-box p { margin: 0; font-size: 14px; line-height: 1.6; color: #334155; }
        
        .contact-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .contact-box span { font-weight: bold; font-size: 16px; color: #1e293b; }
        .wa-btn { background: #dcfce7; color: #059669; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; transition: 0.2s; }
        .wa-btn:hover { background: #059669; color: #fff; }

        .items-summary { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 10px; border-radius: 8px; }

        .card-foot { padding: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .amount-to-collect { font-size: 12px; color: #64748b; }
        .amount-to-collect b { font-size: 22px; color: #d4af37; display: block; margin-top: 5px; }
        
        .deliver-btn { background: #1e293b; color: #fff; border: none; padding: 12px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-family: inherit; }
        .deliver-btn:hover { background: #10b981; }

        .msg { text-align: center; padding: 80px; font-size: 18px; color: #64748b; grid-column: 1/-1; }
      `}</style>
    </div>
  );
}