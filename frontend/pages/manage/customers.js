import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function CustomersManagement() {
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(orders => {
        // تجميع بيانات العملاء من الأوردرات
        const customersMap = {};
        
        orders.forEach(order => {
          const phone = order.customerPhone;
          if (!customersMap[phone]) {
            customersMap[phone] = {
              name: order.customerName,
              phone: phone,
              gov: order.customerGovernorate,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt
            };
          }
          customersMap[phone].totalOrders += 1;
          if (order.status === 'تم التسليم') {
             customersMap[phone].totalSpent += order.totalPrice;
          }
        });

        // تحويل الـ Object لـ Array وترتيبه حسب الأكثر إنفاقاً
        const sortedCustomers = Object.values(customersMap).sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomersData(sortedCustomers);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div dir="rtl" className="admin-page">
      <Head><title>قاعدة العملاء | حكيم جاليري</title></Head>

      <header className="page-header">
        <div className="container header-flex">
          <div className="title-area">
            <Link href="/manage" className="back-link">← رجوع للداشبورد</Link>
            <h1>قاعدة بيانات العملاء 👥</h1>
          </div>
          <div className="total-clients">
             إجمالي العملاء: <b>{customersData.length} عميل</b>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="customers-panel">
          {loading ? <p style={{textAlign:'center', padding:'50px'}}>جاري تجميع بيانات العملاء...</p> : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>رقم الهاتف (واتساب)</th>
                  <th>المنطقة</th>
                  <th style={{textAlign:'center'}}>عدد الطلبات</th>
                  <th>إجمالي المشتريات</th>
                </tr>
              </thead>
              <tbody>
                {customersData.map((client, idx) => (
                  <tr key={idx} className={client.totalOrders > 2 ? 'vip-client' : ''}>
                    <td>
                      <b>{client.name}</b>
                      {client.totalOrders > 2 && <span className="vip-badge">VIP 🌟</span>}
                    </td>
                    <td>
                      <a href={`https://wa.me/2${client.phone.replace(/\D/g,'')}`} target="_blank" className="wa-link">
                         {client.phone} 💬
                      </a>
                    </td>
                    <td>{client.gov}</td>
                    <td align="center"><span className="order-count">{client.totalOrders}</span></td>
                    <td><b className="spent-val">{client.totalSpent} ج.م</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-page { background: #f8fafc; min-height: 100vh; font-family: 'Tajawal', sans-serif; color: #1e293b; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 25px; }
        .page-header { background: #fff; padding: 25px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; }
        .title-area h1 { margin: 10px 0 0; font-size: 24px; }
        .back-link { color: #64748b; text-decoration: none; font-size: 13px; font-weight: bold; }
        .total-clients { background: #1e293b; color: #d4af37; padding: 10px 20px; border-radius: 12px; font-size: 14px; }

        .customers-panel { background: #fff; border-radius: 20px; padding: 10px 30px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; overflow-x: auto; }
        .modern-table { width: 100%; border-collapse: collapse; text-align: right; min-width: 800px; }
        .modern-table th { padding: 20px 15px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 14px; }
        .modern-table td { padding: 18px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .vip-client td { background: #fffdf5; }
        .vip-badge { background: #fef08a; color: #b45309; font-size: 10px; padding: 2px 6px; border-radius: 5px; margin-right: 8px; font-weight: bold; border: 1px solid #fde047; }
        
        .wa-link { color: #059669; text-decoration: none; font-weight: bold; background: #dcfce7; padding: 6px 12px; border-radius: 8px; display: inline-block; transition: 0.2s; }
        .wa-link:hover { background: #059669; color: #fff; }
        
        .order-count { background: #e2e8f0; padding: 4px 12px; border-radius: 50px; font-weight: bold; font-size: 14px; }
        .spent-val { color: #d4af37; font-size: 16px; }
      `}</style>
    </div>
  );
}