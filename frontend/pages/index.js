import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Import refactored modules
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useShippingTimer } from '../hooks/useShippingTimer';
import { orderService } from '../lib/orderService';
import { CATEGORIES, ORDER_STATUSES, SHIPPING_RATES } from '../lib/constants';
import ProductCard from '../components/ProductCard';
import CheckoutModal from '../components/CheckoutModal';

export default function HakeemGalleryFinal() {
    // Custom hooks
    const { products, loading, error: productsError } = useProducts();
    const { 
        cart, 
        toast, 
        addToCart, 
        updateQuantity, 
        getItemPrice, 
        getSubtotal,
        getCartCount,
        clearCart 
    } = useCart();
    const eidMessage = useShippingTimer();
    
    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, type: 'cart', singleItem: null });
    const [successModal, setSuccessModal] = useState({ isOpen: false, orderId: '', waLink: '' });
    const [trackData, setTrackData] = useState({ orderId: '', phone: '' });
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [checkoutData, setCheckoutData] = useState({ 
        name: '', 
        phone: '', 
        gov: '', 
        city: '', 
        address: '', 
        notes: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Remove the old useEffect for shipping timer (now handled by useShippingTimer hook)
    // Remove the old useEffect for products (now handled by useProducts hook)

    // Remove old cart functions (now handled by useCart hook)

    const filteredProducts = useMemo(() => {
        if (!products || !Array.isArray(products)) return [];
        return products.filter(p => 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            (activeCategory === 'all' || p.category === activeCategory)
        );
    }, [products, searchQuery, activeCategory]);

    const handleTrack = async (e) => {
        e.preventDefault();
        try {
            const found = await orderService.trackOrder(trackData.orderId, trackData.phone);
            setTrackedOrder(found);
            if (!found) {
                alert("لم يتم العثور على الطلب ⚠️");
            }
        } catch (error) {
            console.error('Tracking error:', error);
            alert("خطأ في الاتصال");
        }
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        
        const itemsToOrder = checkoutModal.type === 'direct' ? [checkoutModal.singleItem] : cart;
        const subtotal = getSubtotal(itemsToOrder);
        const shippingCost = SHIPPING_RATES[checkoutData.gov] || 0;
        const totalAmount = subtotal + shippingCost;
        
        // Validate order data
        const validationErrors = orderService.validateOrderData(checkoutData, itemsToOrder, totalAmount);
        if (validationErrors.length > 0) {
            alert('يرجى تصحيح الأخطاء التالية:\n' + validationErrors.join('\n'));
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const payload = {
                customerName: checkoutData.name,
                customerPhone: checkoutData.phone,
                customerGovernorate: checkoutData.gov,
                customerAddress: `${checkoutData.city} - ${checkoutData.address}`,
                items: itemsToOrder.map(i => ({ 
                    title: i.title, 
                    qty: i.qty, 
                    price: getItemPrice(i, i.qty) 
                })),
                totalPrice: totalAmount,
                notes: checkoutData.notes,
                status: "جديد"
            };

            const savedOrder = await orderService.createOrder(payload);
            const shortId = savedOrder._id.slice(-6).toUpperCase();
            
            const waLink = orderService.generateWhatsAppLink(payload, savedOrder._id);

            setSuccessModal({ isOpen: true, orderId: shortId, waLink });
            
            if (checkoutModal.type === 'cart') {
                clearCart();
            }
            
            setCheckoutModal({ isOpen: false });
            setCheckoutData({ name: '', phone: '', gov: '', city: '', address: '', notes: '' });
        } catch (error) {
            console.error('Order submission error:', error);
            alert(error.message || "خطأ في السيرفر");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div dir="rtl" className="hakeem-wrap">
            <Head>
                <title>حكيم جاليري | عالم الفخامة</title>
                <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet" />
            </Head>

            {toast && <div className="toast-top">{toast}</div>}

            <div className="ticker-bar">
                <marquee direction="right" scrollamount="7">{eidMessage}</marquee>
            </div>

            <header className="main-header">
                <div className="container nav-flex">
                    <h1 className="logo">حكيم جاليري</h1>
                    <div className="header-actions">
                        <a href="tel:01016176778" className="contact-top">📞 01016176778</a>
                        <Link href="/manage" className="admin-link">🛡️</Link>
                    </div>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h2>مصنعك المتكامل للإبداع والهدايا المخصصة</h2>
                    <p>دقة الليزر، احترافية الطباعة، وسحر الهاند ميد</p>
                    
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="بتدور على إيه النهاردة؟" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <nav className="filter-nav">
                        {CATEGORIES.map(c => (
                            <button 
                                key={c.value} 
                                className={activeCategory === c.value ? 'active' : ''}
                                onClick={() => setActiveCategory(c.value)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </section>

            <main className="container main-content">
                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>جاري التحميل...</div>
                ) : productsError ? (
                    <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>
                        حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.map(p => (
                            <ProductCard 
                                key={p._id} 
                                product={p} 
                                onAddToCart={addToCart}
                                onBuyNow={(product) => {
                                    setCheckoutModal({ 
                                        isOpen: true, 
                                        type: 'direct', 
                                        singleItem: { ...product, qty: 1 } 
                                    });
                                }}
                            />
                        ))}
                    </div>
                )}

                <section className="about-section">
                    <h2 className="gold-text">لماذا تختار حكيم جاليري؟</h2>
                    <div className="about-grid">
                        <div className="about-card"><h3>⚙️ قص وحفر ليزر</h3><p>تنفيذ أدق التفاصيل على الخشب والأكريليك.</p></div>
                        <div className="about-card"><h3>🎁 هدايا بالطلب</h3><p>تصنيع هدايا مخصصة وتجهيزات المناسبات.</p></div>
                        <div className="about-card"><h3>🖨️ مطبعة فنية</h3><p>كافة المطبوعات واللوحات الإعلانية بدقة عالية.</p></div>
                    </div>
                </section>

                <section className="order-tracker">
                    <h2 className="gold-text">📦 تتبع أوردرك</h2>
                    <form className="track-box" onSubmit={handleTrack}>
                        <input type="text" placeholder="كود الطلب" required onChange={e => setTrackData({...trackData, orderId: e.target.value})} />
                        <input type="tel" placeholder="رقم الموبايل" required onChange={e => setTrackData({...trackData, phone: e.target.value})} />
                        <button type="submit">تتبع الآن</button>
                    </form>
                    {trackedOrder && (
                        <div className="track-result">
                            <p>الحالة: <b className="gold-text">{trackedOrder.status}</b></p>
                            <div className="status-bar">
                                <div className={`s-step ${ORDER_STATUSES.slice(0, 1).includes(trackedOrder.status) ? 'done' : ''}`}>مستلم</div>
                                <div className={`s-step ${ORDER_STATUSES.slice(0, 2).includes(trackedOrder.status) ? 'done' : ''}`}>تصميم</div>
                                <div className={`s-step ${ORDER_STATUSES.slice(0, 3).includes(trackedOrder.status) ? 'done' : ''}`}>تصنيع</div>
                                <div className={`s-step ${trackedOrder.status === 'جاهز للتسليم' ? 'done' : ''}`}>جاهز</div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Floating Cart UI */}
            <div className="floating-cart" onClick={() => setCheckoutModal({isOpen: true, type: 'cart'})}>
                🛒 <span className="badge">{getCartCount()}</span>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={checkoutModal.isOpen}
                onClose={() => setCheckoutModal({ isOpen: false })}
                cart={cart}
                singleItem={checkoutModal.singleItem}
                checkoutData={checkoutData}
                setCheckoutData={setCheckoutData}
                onSubmit={submitOrder}
                isSubmitting={isSubmitting}
                updateQuantity={(id, change) => {
                    if (checkoutModal.isOpen && checkoutModal.type === 'direct') {
                        setCheckoutModal(prev => ({
                            ...prev,
                            singleItem: { ...prev.singleItem, qty: Math.max(1, prev.singleItem.qty + change) }
                        }));
                    } else {
                        updateQuantity(id, change);
                    }
                }}
            />

            {/* --- التعديل الجديد في الـ Success Pop --- */}
            {successModal.isOpen && (
                <div className="overlay">
                    <div className="success-pop">
                        <div className="icon-check">✅</div>
                        <h2>ألف مبروك! طلبك وصل</h2>
                        <p>رقم الأوردر: <span className="gold-text">#{successModal.orderId}</span></p>
                        
                        <div className="contact-info">
                            لإتمام الطلب سيتم التواصل معكم على واتساب.<br/><br/>
                            ولتسريع العملية برجاء مراسلتنا بالضغط على الزر بالأسفل.
                        </div>
                        
                        <a 
                            href={successModal.waLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="wa-btn" 
                            onClick={() => setSuccessModal({isOpen: false})}
                        >
                            تأكيد الطلب عبر واتساب 💬
                        </a>
                        
                        <button className="close-link" onClick={() => setSuccessModal({isOpen: false})}>
                            العودة للمتجر
                        </button>
                    </div>
                </div>
            )}

            <footer className="footer">
                <p>© 2026 حكيم جاليري - جميع الحقوق محفوظة</p>
                <p>إتقان في الليزر .. إبداع في الطباعة</p>
            </footer>
        </div>
    );
}