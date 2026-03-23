import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function WorkshopProduction() {
  const [orders, setOrders] = useState([]);
  const [activePhase, setActivePhase] = useState('preparation');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingFields, setEditingFields] = useState({});

  // مراحل العمل الثلاث مع الألوان والأيقونات
  const PHASES = {
    preparation: {
      name: 'مرحلة التجهيز والتصميم',
      icon: '🎨',
      color: '#3B82F6',
      statuses: ['جاري التجهيز', 'جاري التصميم']
    },
    execution: {
      name: 'مرحلة التشغيل والتنفيذ',
      icon: '⚙️',
      color: '#F59E0B',
      statuses: ['في التشغيل', 'في ورشة الليزر', 'في المطبعة', 'في الإنتاج']
    },
    shipping: {
      name: 'جاهز للتسليم / الشحن',
      icon: '🚚',
      color: '#10B981',
      statuses: ['جاهز للتسليم']
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('📡 جاري جلب الأوامر من الخادم...');
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      
      const ordersData = data.data || data || [];
      const workshopOrders = ordersData.filter(o => 
        Object.values(PHASES).some(p => p.statuses.includes(o.status))
      ).reverse();

      setOrders(workshopOrders);
      setLoading(false);
      console.log('✅ تم تحميل', workshopOrders.length, 'أمر');
    } catch (err) { 
      console.error("❌ خطأ في تحميل الأوامر:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); 
    return () => clearInterval(interval);
  }, []);

  // جلب الأوامر في المرحلة الحالية
  const getPhaseOrders = (phase) => {
    return orders.filter(o => PHASES[phase].statuses.includes(o.status));
  };

  // تحديث الحقول الإضافية
  const updateField = (orderId, field, value) => {
    setOrders(prev => prev.map(o => 
      o._id === orderId ? { ...o, [field]: value } : o
    ));
    setEditingFields(prev => ({...prev, [orderId]: true}));
  };

  // 🔥 رفع الملفات المتعددة
  const handleFileUpload = async (orderId, files) => {
    if (!files || files.length === 0) return;

    try {
      console.log(`📁 جاري رفع ${files.length} ملف...`);
      
      // رفع كل ملف على حدة
      const uploadedFiles = [];
      
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`فشل رفع الملف: ${file.name}`);
        }

        const result = await response.json();
        const fileUrl = result.data?.url || result.url;
        
        uploadedFiles.push({
          name: file.name,
          size: file.size,
          url: fileUrl,
          uploadedAt: new Date().toISOString()
        });
        
        console.log(`✅ تم رفع: ${file.name}`);
      }

      // تحديث الملفات المرفوعة في الأمر
      setOrders(prev => prev.map(o => 
        o._id === orderId ? { 
          ...o, 
          uploadedFiles: [...(o.uploadedFiles || []), ...uploadedFiles]
        } : o
      ));

      setEditingFields(prev => ({...prev, [orderId]: true}));
      
      // حفظ في قاعدة البيانات
      const order = orders.find(or => or._id === orderId);
      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadedFiles: [...(order?.uploadedFiles || []), ...uploadedFiles]
        })
      });

      alert(`✅ تم رفع ${uploadedFiles.length} ملف بنجاح`);
      console.log('✅ تم حفظ الملفات');
    } catch (err) {
      console.error('❌ خطأ في رفع الملفات:', err);
      alert('❌ حدث خطأ في رفع الملفات: ' + err.message);
    }
  };

  // 🔥 حذف ملف مرفوع
  const deleteUploadedFile = (orderId, fileIndex) => {
    setOrders(prev => prev.map(o => 
      o._id === orderId ? { 
        ...o, 
        uploadedFiles: o.uploadedFiles?.filter((_, idx) => idx !== fileIndex) || []
      } : o
    ));
    setEditingFields(prev => ({...prev, [orderId]: true}));
  };

  // حفظ البيانات للخادم
  const saveOrderData = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    try {
      console.log(`📝 حفظ البيانات للأمر ${orderId}...`);
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNote: order.adminNote,
          fileLink: order.fileLink,
          uploadedFiles: order.uploadedFiles || [],
          additionalData: {
            dimensions: order.dimensions || '',
            material: order.material || '',
            uploadedFiles: order.uploadedFiles || []
          }
        })
      });

      if (!response.ok) throw new Error('فشل الحفظ');
      
      console.log('✅ تم حفظ البيانات بنجاح');
      setEditingFields(prev => ({...prev, [orderId]: false}));
      await fetchOrders();
    } catch (err) {
      console.error('❌ خطأ:', err);
      alert('حدث خطأ في حفظ البيانات');
    }
  };

  // الانتقال إلى المرحلة التالية
  const moveToNextPhase = async (orderId, currentPhase) => {
    const order = orders.find(o => o._id === orderId);
    const phaseKeys = Object.keys(PHASES);
    const currentIndex = phaseKeys.indexOf(currentPhase);
    
    if (currentIndex >= phaseKeys.length - 1) {
      alert('⚠️ الأمر سيتم نقله لقائمة الشحن!');
    }

    const nextPhaseKey = phaseKeys[currentIndex + 1];
    const nextStatus = nextPhaseKey === 'shipping' ? 'جاهز للتسليم' : 'في التشغيل';

    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      console.log(`✅ تم نقل الأمر من ${currentPhase} إلى ${nextPhaseKey}`);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('❌ خطأ في النقل:', err);
      alert('حدث خطأ أثناء نقل الأمر');
    }
  };

  // طباعة تذكرة التشغيل
  const printTicket = (order) => {
    const win = window.open('', '_blank');
    const remaining = order.totalPrice - (order.depositAmount || 0);
    
    const html = `
      <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .ticket { width: 350px; margin: auto; background: white; border: 2px dashed #000; padding: 15px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 18px; }
          .header p { margin: 5px 0 0; font-size: 12px; }
          .order-id { background: #000; color: white; display: inline-block; padding: 5px 10px; margin: 10px 0; font-weight: bold; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; background: #eee; padding: 5px; margin-bottom: 8px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 13px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 5px; text-align: right; font-size: 12px; }
          .items-table th { background: #eee; }
          .summary { border: 2px solid #000; padding: 10px; background: #fafafa; }
          .total { font-weight: bold; font-size: 16px; }
          .print-note { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>🏭 حكيم جاليري</h1>
            <p>تذكرة التشغيل والتنفيذ</p>
            <div class="order-id">#${order._id.slice(-6).toUpperCase()}</div>
          </div>

          <div class="section">
            <div class="section-title">👤 بيانات العميل</div>
            <div class="row"><span>الاسم:</span> <strong>${order.customerName}</strong></div>
            <div class="row"><span>الجوال:</span> <strong>${order.customerPhone}</strong></div>
            <div class="row"><span>المحافظة:</span> <strong>${order.customerGovernorate}</strong></div>
          </div>

          <div class="section">
            <div class="section-title">🛒 الأصناف المطلوبة</div>
            <table class="items-table">
              <thead>
                <tr><th>الصنف</th><th>الكمية</th></tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.title}</td>
                    <td>${item.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">📐 مواصفات التصنيع</div>
            <div class="row"><span>المقاسات:</span> <strong>${order.dimensions || 'لم يتم تحديده'}</strong></div>
            <div class="row"><span>نوع الخامة:</span> <strong>${order.material || 'لم يتم تحديده'}</strong></div>
            ${order.adminNote ? `<div class="row"><span>ملاحظات:</span> <strong>${order.adminNote}</strong></div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">💰 الحساب المالي</div>
            <div class="summary">
              <div class="row"><span>الإجمالي:</span> <strong>${order.totalPrice} ج.م</strong></div>
              <div class="row"><span>المدفوع (عربون):</span> <strong>${order.depositAmount || 0} ج.م</strong></div>
              <div class="row total"><span>المتبقي:</span> <strong>${remaining} ج.م</strong></div>
            </div>
          </div>

          <div class="print-note">
            <p>طُبع في: ${new Date().toLocaleString('ar-EG')}</p>
            <p>⚠️ يرجى الحفاظ على هذه التذكرة أثناء العمل</p>
          </div>
        </div>
      </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 100);
  };

  const phaseOrders = getPhaseOrders(activePhase);

  return (
    <div dir="rtl" className="workshop-production">
      <Head><title>💼 شاشة الورشة - حكيم جاليري</title></Head>

      <header className="ws-header">
        <div className="ws-header-content">
          <div className="header-left">
            <Link href="/manage" className="back-btn">← رجوع</Link>
            <h1>🏭 شاشة الورشة وخط الإنتاج</h1>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-number">{getPhaseOrders('preparation').length}</span>
              <span className="stat-label">التجهيز</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{getPhaseOrders('execution').length}</span>
              <span className="stat-label">التشغيل</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{getPhaseOrders('shipping').length}</span>
              <span className="stat-label">الشحن</span>
            </div>
          </div>
        </div>
      </header>

      <main className="ws-main">
        {/* 🔥 شريط اختيار المراحل */}
        <div className="phases-selector">
          {Object.entries(PHASES).map(([key, phase]) => (
            <button
              key={key}
              className={`phase-btn ${activePhase === key ? 'active' : ''}`}
              onClick={() => setActivePhase(key)}
              style={{
                borderColor: activePhase === key ? phase.color : '#ddd',
                backgroundColor: activePhase === key ? phase.color + '10' : 'white'
              }}
            >
              <span className="phase-icon">{phase.icon}</span>
              <div>
                <span className="phase-name">{phase.name}</span>
                <span className="phase-count">{getPhaseOrders(key).length} أمر</span>
              </div>
            </button>
          ))}
        </div>

        {/* 🔥 قائمة الأوامر حسب المرحلة */}
        <div className="orders-section">
          {loading ? (
            <div className="empty-state loading">⏳ جاري تحميل الأوامر...</div>
          ) : phaseOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <p>لا توجد أوامر في هذه المرحلة</p>
              <small>الورشة في وضع جيد!</small>
            </div>
          ) : (
            <div className="orders-list">
              {phaseOrders.map(order => (
                <div
                  key={order._id}
                  className="order-card"
                  onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                >
                  <div className="card-header">
                    <div className="order-identity">
                      <span className="order-code">#{order._id.slice(-6).toUpperCase()}</span>
                      <span className="customer-name">{order.customerName}</span>
                    </div>
                    <span className="expand-icon">{selectedOrder?._id === order._id ? '▼' : '▶'}</span>
                  </div>

                  <div className="card-summary">
                    <span className="items-count">🛒 {order.items.length} صنف</span>
                    <span className="phone">📞 {order.customerPhone}</span>
                    <span className="city">📍 {order.customerGovernorate}</span>
                  </div>

                  {/* التفاصيل الموسّعة */}
                  {selectedOrder?._id === order._id && (
                    <div className="card-details">
                      <div className="details-content">
                        {/* 🔥 قسم البيانات الإضافية */}
                        <div className="details-section">
                          <h4>📐 البيانات الإضافية</h4>

                          <div className="input-group">
                            <label>المقاسات:</label>
                            <input
                              type="text"
                              placeholder="مثال: 20x30 سم"
                              value={order.dimensions || ''}
                              onChange={(e) => updateField(order._id, 'dimensions', e.target.value)}
                            />
                          </div>

                          <div className="input-group">
                            <label>نوع الخامة:</label>
                            <input
                              type="text"
                              placeholder="مثال: خشب، أكريليك، ألمنيوم"
                              value={order.material || ''}
                              onChange={(e) => updateField(order._id, 'material', e.target.value)}
                            />
                          </div>

                          <div className="input-group">
                            <label>📝 ملاحظات التصنيع:</label>
                            <textarea
                              placeholder="أكتب أي ملاحظات أو تعديلات مهمة..."
                              value={order.adminNote || ''}
                              onChange={(e) => updateField(order._id, 'adminNote', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* 🔥 قسم الملفات المتعددة */}
                        <div className="details-section">
                          <h4>📁 ملفات التصميم</h4>

                          {/* رفع الملفات - مرحلة التجهيز فقط */}
                          {order.status === 'جاري التجهيز' || order.status === 'جاري التصميم' ? (
                            <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '2px dashed #3b82f6' }}>
                              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                                📤 رفع الملفات من جهازك (متعدد)
                              </label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="file"
                                  id={`file-upload-${order._id}`}
                                  multiple
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      handleFileUpload(order._id, Array.from(e.target.files));
                                      e.target.value = '';
                                    }
                                  }}
                                  style={{ flex: 1, padding: '8px', border: '1px solid #cbdcf6', borderRadius: '4px' }}
                                  accept="*/*"
                                />
                                <button
                                  onClick={() => {
                                    const input = document.getElementById(`file-upload-${order._id}`);
                                    input?.click();
                                  }}
                                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                  اختر الملفات ➕
                                </button>
                              </div>
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>💡 يمكنك اختيار عدة ملفات في نفس الوقت (صور، PDF، تصاميم، إلخ)</p>
                            </div>
                          ) : null}

                          {/* قائمة الملفات المرفوعة */}
                          {order.uploadedFiles && order.uploadedFiles.length > 0 ? (
                            <div style={{ backgroundColor: '#f9f5ff', border: '1px solid #e5d9f6', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                              <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b21a8', marginBottom: '10px' }}>✅ الملفات المرفوعة ({order.uploadedFiles.length}):</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.uploadedFiles.map((file, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fef3c7', padding: '10px', borderRadius: '4px', borderLeft: '4px solid #d97706' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', overflowWrap: 'break-word' }}>📄 {file.name}</p>
                                      <p style={{ fontSize: '11px', color: '#78350f', marginTop: '2px' }}>
                                        {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'حجم غير محدد'} • {new Date(file.uploadedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                      </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                                      <a
                                        href={file.url}
                                        download
                                        style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' }}
                                        title="تحميل الملف"
                                      >
                                        ⬇️
                                      </a>
                                      {(order.status === 'جاري التجهيز' || order.status === 'جاري التصميم') && (
                                        <button
                                          onClick={() => {
                                            deleteUploadedFile(order._id, idx);
                                            setEditingFields(prev => ({...prev, [order._id]: true}));
                                          }}
                                          style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                          title="حذف الملف"
                                        >
                                          🗑️
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : activePhase === 'preparation' ? (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e5e7eb', borderRadius: '6px', border: '2px dashed #999' }}>
                              <p style={{ fontSize: '13px', color: '#666' }}>📭 لم يتم رفع أي ملفات بعد</p>
                            </div>
                          ) : null}

                          {/* رابط بديل للملفات من مصادر خارجية */}
                          {activePhase === 'preparation' && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                                🔗 أو أضف رابط خارجي (درايف، ميديافاير، إلخ)
                              </label>
                              <input
                                type="text"
                                placeholder="https://drive.google.com/... أو أي رابط"
                                value={order.fileLink || ''}
                                onChange={(e) => updateField(order._id, 'fileLink', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* 🔥 الأصناف */}
                        <div className="details-section">
                          <h4>🛒 الأصناف</h4>
                          <div className="items-summary">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="item-summary-row">
                                <strong>{item.title}</strong>
                                <span className="qty-badge">x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 🔥 الأزرار والإجراءات */}
                        <div className="card-actions">
                          {editingFields[order._id] && (
                            <button
                              className="action-btn save-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveOrderData(order._id);
                              }}
                            >
                              💾 حفظ البيانات
                            </button>
                          )}

                          <button
                            className="action-btn print-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              printTicket(order);
                            }}
                          >
                            🖨️ طباعة التذكرة
                          </button>

                          <button
                            className="action-btn next-phase-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToNextPhase(order._id, activePhase);
                            }}
                          >
                            ⬅️ نقل للمرحلة التالية
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .workshop-production {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Tajawal', sans-serif;
          color: #1e293b;
        }

        .ws-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .ws-header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          flex: 1;
        }

        .back-btn {
          display: inline-block;
          color: white;
          text-decoration: none;
          margin-bottom: 10px;
          font-weight: bold;
          font-size: 14px;
        }

        .back-btn:hover {
          text-decoration: underline;
        }

        .ws-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .header-stats {
          display: flex;
          gap: 15px;
        }

        .stat-box {
          background: rgba(255,255,255,0.1);
          padding: 12px 20px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: bold;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
        }

        .ws-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .phases-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .phase-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .phase-btn:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .phase-btn.active {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .phase-icon {
          font-size: 28px;
        }

        .phase-name {
          display: block;
          font-weight: bold;
          color: #1e293b;
        }

        .phase-count {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .orders-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .empty-state.loading {
          font-size: 16px;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-card {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .order-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f5f7fa;
          border-bottom: 1px solid #e2e8f0;
        }

        .order-identity {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .order-code {
          background: #667eea;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
        }

        .customer-name {
          font-weight: bold;
          color: #1e293b;
        }

        .expand-icon {
          font-size: 12px;
          color: #94a3b8;
          transition: transform 0.3s;
        }

        .card-summary {
          display: flex;
          gap: 20px;
          padding: 12px 15px;
          font-size: 13px;
          color: #64748b;
        }

        .card-details {
          padding: 20px 15px;
          border-top: 1px solid #e2e8f0;
          background: #fafbfc;
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-section h4 {
          margin: 0 0 15px;
          color: #1e293b;
          font-size: 14px;
          font-weight: bold;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: bold;
          color: #475569;
        }

        .input-group input,
        .input-group textarea {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-family: inherit;
          font-size: 13px;
        }

        .input-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .file-input-group input {
          padding: 10px 12px;
          border: 2px dashed #3B82F6;
          border-radius: 6px;
          background: #eff6ff;
        }

        .file-download-btn {
          display: inline-block;
          padding: 10px 16px;
          background: #10B981;
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          font-size: 13px;
          transition: background 0.3s;
        }

        .file-download-btn:hover {
          background: #059669;
        }

        .no-file-alert {
          padding: 12px;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 4px;
          color: #991b1b;
          font-size: 13px;
        }

        .items-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          font-size: 13px;
        }

        .qty-badge {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
        }

        .card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .action-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
          min-width: 150px;
        }

        .save-btn {
          background: #3B82F6;
          color: white;
        }

        .save-btn:hover {
          background: #2563eb;
        }

        .print-btn {
          background: #F59E0B;
          color: white;
        }

        .print-btn:hover {
          background: #d97706;
        }

        .next-phase-btn {
          background: #10B981;
          color: white;
        }

        .next-phase-btn:hover {
          background: #059669;
        }

        @media (max-width: 768px) {
          .ws-header-content {
            flex-direction: column;
            gap: 20px;
          }

          .header-stats {
            width: 100%;
          }

          .phases-selector {
            grid-template-columns: 1fr;
          }

          .card-summary {
            flex-wrap: wrap;
          }

          .action-btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
