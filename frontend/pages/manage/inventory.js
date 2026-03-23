import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function InventoryManagement() {
  // داتا مبدئية للمخزن (ممكن نربطها بداتابيز بعدين)
  const [inventory, setInventory] = useState([
    { id: 1, name: 'لوح خشب MDF 3ملي', qty: 45, unit: 'لوح', minAlert: 10 },
    { id: 2, name: 'أكريليك شفاف 2ملي', qty: 4, unit: 'لوح', minAlert: 5 },
    { id: 3, name: 'حبر سبليماشن أسود', qty: 3, unit: 'لتر', minAlert: 2 },
    { id: 4, name: 'ميداليات خشب سادة', qty: 150, unit: 'قطعة', minAlert: 50 },
  ]);

  const updateQty = (id, amount) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + amount) } : item
    ));
  };

  return (
    <div dir="rtl" className="admin-page">
      <Head><title>المخزن | حكيم جاليري</title></Head>

      <header className="page-header">
        <div className="container header-flex">
          <div className="title-area">
            <Link href="/manage" className="back-link">← رجوع للداشبورد</Link>
            <h1>إدارة الخامات والمخازن 🗄️</h1>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="inventory-panel">
          <div className="panel-header">
             <h3>جرد الخامات الحالي</h3>
             <button className="add-new-btn">+ إضافة خامة جديدة</button>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th>اسم الخامة</th>
                <th>الرصيد الحالي</th>
                <th>تحديث سريع</th>
                <th>حالة المخزون</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className={item.qty <= item.minAlert ? 'alert-row' : ''}>
                  <td><b>{item.name}</b></td>
                  <td><span className="qty-number">{item.qty} {item.unit}</span></td>
                  <td>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, -1)} className="btn-minus">-</button>
                      <button onClick={() => updateQty(item.id, 1)} className="btn-plus">+</button>
                    </div>
                  </td>
                  <td>
                    {item.qty <= item.minAlert ? 
                      <span className="badge danger">⚠️ اطلب فوراً (الحد الأدنى: {item.minAlert})</span> : 
                      <span className="badge safe">✅ رصيد آمن</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
        .admin-page { background: #f8fafc; min-height: 100vh; font-family: 'Tajawal', sans-serif; color: #1e293b; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 25px; }
        .page-header { background: #fff; padding: 25px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
        .title-area h1 { margin: 10px 0 0; font-size: 24px; }
        .back-link { color: #64748b; text-decoration: none; font-size: 13px; font-weight: bold; }
        
        .inventory-panel { background: #fff; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .panel-header h3 { margin: 0; }
        .add-new-btn { background: #1e293b; color: #d4af37; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; }

        .modern-table { width: 100%; border-collapse: collapse; text-align: right; }
        .modern-table th { padding: 15px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 14px; }
        .modern-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .alert-row td { background: #fffcfc; }
        
        .qty-number { font-size: 18px; font-weight: 900; }
        .qty-controls { display: inline-flex; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .qty-controls button { width: 35px; height: 35px; border: none; background: #f8fafc; font-size: 18px; cursor: pointer; transition: 0.2s; }
        .btn-minus:hover { background: #fee2e2; color: #ef4444; }
        .btn-plus:hover { background: #dcfce7; color: #10b981; }

        .badge { padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: bold; }
        .badge.safe { background: #dcfce7; color: #059669; }
        .badge.danger { background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; }
      `}</style>
    </div>
  );
}