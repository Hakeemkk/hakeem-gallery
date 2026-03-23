import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isManualModalOpen, setManualModalOpen] = useState(false);
  
  // داتا الفورم اليدوي
  const [manualData, setManualData] = useState({ name: '', phone: '', address: '', items: '', price: '', shipping: '' });

  // 1. جلب البيانات
  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 2. تحديث الحالة
  const updateOrderStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders(); // تحديث القائمة بعد التعديل
  };

  // 3. حذف الطلب
  const deleteOrder = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    }
  };

  // 4. إضافة طلب يدوي
  const submitManualOrder = async (e) => {
    e.preventDefault();
    const newOrder = {
      customerName: manualData.name,
      customerPhone: manualData.phone,
      customerGovernorate: "طلب يدوي",
      customerAddress: manualData.address,
      items: [{ title: manualData.items, qty: 1, price: Number(manualData.price) }],
      totalPrice: Number(manualData.price) + Number(manualData.shipping),
      shippingCost: Number(manualData.shipping),
      status: 'جديد',
      source: 'WhatsApp'
    };

    await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });

    setManualModalOpen(false);
    setManualData({ name: '', phone: '', address: '', items: '', price: '', shipping: '' });
    fetchOrders();
  };

  // 5. طباعة الفاتورة
  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة - ${order.customerName}</title>
          <style>
            body { font-family: Tahoma, Arial; padding: 40px; }
            .box { border: 2px solid #000; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: center; }
            .total { font-size: 24px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">حكيم جاليري - بوليصة شحن</h1>
          <div class="box">
            <p><strong>العميل:</strong> ${order.customerName}</p>
            <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
            <p><strong>العنوان:</strong> ${order.customerGovernorate} - ${order.customerAddress}</p>
          </div>
          <table>
            <tr><th>المنتج</th><th>السعر</th></tr>
            ${order.items.map(i => `<tr><td>${i.title} (x${i.qty || 1})</td><td>${(i.price * (i.qty || 1))} ج</td></tr>`).join('')}
          </table>
          <div class="total">الإجمالي المطلوب: ${order.totalPrice} ج</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // الفلترة والبحث
  const filteredOrders = orders.filter(o => {
    const matchSearch = (o.customerName || '').includes(searchTerm) || (o.customerPhone || '').includes(searchTerm);
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div dir="rtl" className="dashboard-container">
      <Head>
        <title>إدارة الطلبات | حكيم جاليري</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>

      {/* شريط التنقل العلوي */}
      <nav className="navbar">
        <h2>📦 لوحة الطلبات (System)</h2>
        <div className="nav-actions">
          <button className="btn-primary" onClick={() => setManualModalOpen(true)}>+ طلب يدوي</button>
          <Link href="/manage" className="btn-secondary">لوحة التحكم</Link>
        </div>
      </nav>

      {/* أدوات البحث والفلترة */}
      <div className="tools-bar">
        <input 
          type="text" 
          placeholder="🔍 ابحث بالاسم أو رقم الهاتف..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="جديد">جديد</option>
          <option value="جاري التنفيذ">جاري التنفيذ</option>
          <option value="تم التسليم">تم التسليم</option>
          <option value="ملغي">ملغي</option>
        </select>
      </div>

      {/* شبكة الطلبات */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888' }}>لا توجد طلبات تطابق بحثك.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className={`order-card status-${order.status === 'جاري التنفيذ' ? 'progress' : order.status === 'تم التسليم' ? 'done' : order.status === 'ملغي' ? 'cancel' : 'new'}`}>
              <div className="card-header">
                <h3>{order.customerName}</h3>
                <span className="status-badge">{order.status}</span>
              </div>
              
              <div className="card-body">
                <p>📞 {order.customerPhone}</p>
                <p>📍 {order.customerGovernorate}</p>
                <div className="price-tag">💰 {order.totalPrice} ج</div>
                
                <div className="items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="item-row">• {item.title}</div>
                  ))}
                </div>
              </div>

              <div className="card-actions">
                <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                  <option value="جديد">جديد</option>
                  <option value="جاري التنفيذ">جاري التنفيذ</option>
                  <option value="تم التسليم">تم التسليم</option>
                  <option value="ملغي">ملغي</option>
                </select>
                <button className="btn-icon print" onClick={() => printInvoice(order)}>🖨️</button>
                <button className="btn-icon delete" onClick={() => deleteOrder(order._id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة الطلب اليدوي المنبثقة (Modal) */}
      {isManualModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>📝 تسجيل طلب يدوي</h3>
            <form onSubmit={submitManualOrder}>
              <input type="text" placeholder="الاسم" required onChange={e => setManualData({...manualData, name: e.target.value})} />
              <input type="text" placeholder="رقم الهاتف" required onChange={e => setManualData({...manualData, phone: e.target.value})} />
              <input type="text" placeholder="العنوان التفصيلي" required onChange={e => setManualData({...manualData, address: e.target.value})} />
              <input type="text" placeholder="المنتجات المطلوبة" required onChange={e => setManualData({...manualData, items: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="سعر المنتجات" required onChange={e => setManualData({...manualData, price: e.target.value})} />
                <input type="number" placeholder="مصاريف الشحن" required onChange={e => setManualData({...manualData, shipping: e.target.value})} />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">حفظ الطلب</button>
                <button type="button" className="btn-secondary" onClick={() => setManualModalOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* التصميم (CSS المدمج النظيف) */}
      <style jsx>{`
        .dashboard-container {
          font-family: 'Tajawal', sans-serif;
          background-color: #f4f7f6;
          min-height: 100vh;
          padding: 20px;
          color: #333;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a1a;
          padding: 15px 30px;
          border-radius: 15px;
          color: #d4af37;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        .navbar h2 { margin: 0; }
        .nav-actions { display: flex; gap: 15px; }
        
        .btn-primary { background: #d4af37; color: #1a1a1a; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3); }
        .btn-secondary { background: #333; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; text-decoration: none; cursor: pointer; }
        
        .tools-bar {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }
        .search-input { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 10px; font-family: 'Tajawal'; font-size: 16px; outline: none; }
        .filter-select { padding: 15px; border: 1px solid #ddd; border-radius: 10px; font-family: 'Tajawal'; font-size: 16px; outline: none; cursor: pointer; }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .order-card {
          background: #fff;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-right: 6px solid #ccc;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
        }
        .order-card:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
        
        /* ألوان الحالات */
        .status-new { border-right-color: #f39c12; }
        .status-progress { border-right-color: #3498db; }
        .status-done { border-right-color: #2ecc71; }
        .status-cancel { border-right-color: #e74c3c; }

        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
        .card-header h3 { margin: 0; font-size: 18px; color: #1a1a1a; }
        .status-badge { background: #f8f9fa; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #555; }
        
        .card-body p { margin: 5px 0; color: #555; font-size: 14px; }
        .price-tag { display: inline-block; background: #fff8e1; color: #b8860b; padding: 5px 15px; border-radius: 8px; font-weight: bold; margin-top: 10px; }
        
        .items-list { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee; font-size: 13px; color: #666; }
        .item-row { margin-bottom: 5px; }

        .card-actions { margin-top: auto; padding-top: 15px; display: flex; gap: 10px; align-items: center; }
        .card-actions select { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Tajawal'; }
        .btn-icon { background: #f8f9fa; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; cursor: pointer; transition: 0.2s; }
        .btn-icon:hover { background: #eee; }
        .btn-icon.print:hover { border-color: #3498db; }
        .btn-icon.delete:hover { border-color: #e74c3c; background: #fdeaea; }

        /* المودال */
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: #fff; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .modal h3 { margin-top: 0; color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; display: inline-block; }
        .modal input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: 'Tajawal'; }
        .modal-buttons { display: flex; gap: 10px; margin-top: 10px; }
        .modal-buttons button { flex: 1; }
      `}</style>
    </div>
  );
}