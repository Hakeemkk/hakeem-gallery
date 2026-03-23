import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useProducts } from '../../hooks/useProducts';
import { validateProductData, formatProductData, getCategoryName, getDefaultProductForm } from '../../utils/productUtils';
import ImageUpload from '../../components/ImageUpload';

export default function ProductsManagement() {
  const { products, loading, error, createProduct, deleteProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [productForm, setProductForm] = useState(getDefaultProductForm());

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const formattedData = formatProductData(productForm);
    const validationErrors = validateProductData(formattedData);
    
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors([]);
    
    try {
      await createProduct(formattedData);
      setProductForm(getDefaultProductForm());
      alert("✅ تم إضافة المنتج بنجاح!");
    } catch (err) {
      console.error('❌ Error creating product:', err);
      const errorMsg = err.message || err.toString() || 'حدث خطأ أثناء الإضافة';
      setFormErrors([errorMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من مسح هذا المنتج نهائياً؟')) {
      try {
        await deleteProduct(id);
        alert("✅ تم حذف المنتج بنجاح!");
      } catch (err) {
        console.error('❌ Error deleting product:', err);
        const errorMsg = err.message || err.toString() || 'Unknown error';
        alert("حدث خطأ أثناء الحذف: " + errorMsg);
      }
    }
  };

  return (
    <div dir="rtl" className="admin-page">
      <Head><title>المنتجات | حكيم جاليري</title></Head>

      <header className="page-header">
        <div className="container header-flex">
          <div className="title-area">
            <Link href="/manage" className="back-link">← رجوع للداشبورد</Link>
            <h1>إدارة المنتجات والأسعار 🏷️</h1>
          </div>
        </div>
      </header>

      <main className="container split-layout">
        {/* فورم إضافة منتج */}
        <div className="form-panel">
          <h3>إضافة منتج جديد للموقع</h3>
          <form onSubmit={handleAddProduct}>
            <div className="f-group"><label>اسم المنتج</label><input type="text" required value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} /></div>
            <div className="f-row">
               <div className="f-group"><label>السعر (قطاعي)</label><input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} /></div>
               <div className="f-group"><label>القسم</label>
                 <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                   <option value="laser">ليزر</option><option value="print">طباعة</option><option value="gifts">هدايا</option>
                 </select>
               </div>
            </div>
            <div className="f-group">
              <label>الصورة</label>
              <ImageUpload
                value={productForm.img}
                onChange={(value) => setProductForm({...productForm, img: value})}
                label="صورة المنتج"
                required={true}
              />
            </div>
            
            <div className="wholesale-box">
              <h4>تسعير الجملة (اختياري)</h4>
              <div className="f-row">
                 <div className="f-group"><label>يبدأ من كمية</label><input type="number" placeholder="مثال: 10" value={productForm.tier2Qty} onChange={e => setProductForm({...productForm, tier2Qty: e.target.value})} /></div>
                 <div className="f-group"><label>سعر القطعة (جملة)</label><input type="number" placeholder="مثال: 45" value={productForm.tier2Price} onChange={e => setProductForm({...productForm, tier2Price: e.target.value})} /></div>
              </div>
            </div>

            {/* Form Errors */}
            {formErrors.length > 0 && (
              <div className="form-errors">
                <h4>يرجى تصحيح الأخطاء التالية:</h4>
                <ul>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الرفع...' : 'نشر المنتج 🚀'}
            </button>
          </form>
        </div>

        {/* عرض المنتجات */}
        <div className="products-grid">
          {loading ? (
            <div className="loading-message">جاري تحميل المنتجات...</div>
          ) : error ? (
            <div className="error-message">حدث خطأ: {error}</div>
          ) : products.length === 0 ? (
            <div className="empty-message">لا توجد منتجات حالياً</div>
          ) : (
            products.map(p => (
              <div key={p._id} className="prod-card">
                <img 
                  src={p.img} 
                  alt={p.title} 
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="p-info">
                  <h4>{p.title}</h4>
                  <div className="p-category">{getCategoryName(p.category)}</div>
                  <div className="p-price">{p.price} ج.م</div>
                  {p.tier2Qty && (
                    <div className="p-wholesale">
                      جملة: {p.tier2Price}ج (أكثر من {p.tier2Qty})
                    </div>
                  )}
                  <button className="del-btn" onClick={() => handleDelete(p._id)}>
                    حذف المنتج 🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-page { background: #f8fafc; min-height: 100vh; font-family: 'Tajawal', sans-serif; color: #1e293b; padding-bottom: 50px; }
        .container { max-width: 1300px; margin: 0 auto; padding: 0 25px; }
        .page-header { background: #fff; padding: 25px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 40px; }
        .title-area h1 { margin: 10px 0 0; font-size: 24px; color: #111; }
        .back-link { color: #64748b; text-decoration: none; font-size: 13px; font-weight: bold; }
        
        .split-layout { display: flex; gap: 30px; align-items: flex-start; }
        
        .form-panel { flex: 1; background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; position: sticky; top: 20px; min-width: 350px; }
        .form-panel h3 { margin-top: 0; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; }
        .f-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .f-group label { margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #64748b; }
        .f-group input, .f-group select { padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-family: inherit; }
        .f-group input:focus, .f-group select:focus { border-color: #d4af37; }
        .f-row { display: flex; gap: 15px; }
        
        .wholesale-box { background: #fdfaf0; padding: 20px; border-radius: 15px; border: 1px dashed #d4af37; margin: 25px 0; }
        .wholesale-box h4 { margin: 0 0 15px; color: #b48900; font-size: 14px; }
        
        .submit-btn { width: 100%; background: #1e293b; color: #d4af37; border: none; padding: 15px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .submit-btn:hover { background: #111; transform: translateY(-2px); }

        .products-grid { flex: 2; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .prod-card { background: #fff; border-radius: 15px; border: 1px solid #e2e8f0; overflow: hidden; text-align: center; }
        .prod-card img { width: 100%; height: 180px; object-fit: cover; }
        .p-info { padding: 20px; }
        .p-info h4 { margin: 0 0 10px; font-size: 16px; }
        .p-category { font-size: 12px; color: #64748b; margin-bottom: 5px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .p-price { font-size: 20px; font-weight: 900; color: #1e293b; }
        .p-wholesale { font-size: 11px; color: #ef4444; font-weight: bold; margin-top: 5px; background: #fee2e2; padding: 5px; border-radius: 5px; }
        .del-btn { width: 100%; margin-top: 15px; background: #fee2e2; color: #ef4444; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .del-btn:hover { background: #ef4444; color: #fff; }
        
        .form-errors { background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .form-errors h4 { margin: 0 0 10px; color: #dc2626; font-size: 14px; }
        .form-errors ul { margin: 0; padding-left: 20px; color: #dc2626; }
        .form-errors li { margin-bottom: 5px; }
        
        .loading-message, .error-message, .empty-message { text-align: center; padding: 40px; color: #64748b; }
        .error-message { color: #ef4444; }
        .empty-message { color: #94a3b8; }

        @media (max-width: 900px) { .split-layout { flex-direction: column; } .form-panel { width: 100%; position: static; } }
      `}</style>
    </div>
  );
}