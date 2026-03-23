import React from 'react';
import { calculateItemPrice, calculateWholesaleProgress, getNextWholesaleTier } from '../utils/pricingUtils';
import { SHIPPING_RATES } from '../lib/constants';

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  singleItem, 
  checkoutData, 
  setCheckoutData, 
  onSubmit, 
  isSubmitting,
  updateQuantity 
}) => {
  const items = singleItem ? [singleItem] : cart;
  
  const getSubtotal = (items) => {
    return items.reduce((sum, item) => {
      const price = calculateItemPrice(item, item.qty);
      return sum + (price * item.qty);
    }, 0);
  };

  const shippingCost = SHIPPING_RATES[checkoutData.gov] || 0;
  const totalAmount = getSubtotal(items) + shippingCost;

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="mega-checkout">
        <button className="close-mega" onClick={onClose}>✕</button>
        <div className="mega-flex">
          {/* Summary */}
          <div className="m-summary">
            <h2>ملخص الطلب</h2>
            <div className="m-list">
              {items.map(item => (
                <div key={item._id} className="m-row">
                  <img src={item.img} alt={item.title} />
                  <div className="m-info">
                    <h4>{item.title}</h4>
                    <div className="m-qty">
                      <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                    </div>
                    {item.tier2Qty && (
                      <div className="m-wholesale">
                        <div className="m-bar">
                          <div 
                            className="m-fill" 
                            style={{width: `${calculateWholesaleProgress(item, item.qty)}%`}}
                          ></div>
                        </div>
                        <small>
                          {(() => {
                            const nextTier = getNextWholesaleTier(item, item.qty);
                            return nextTier 
                              ? `باقي ${nextTier.remaining} لخصم الجملة` 
                              : '✅ تم تطبيق الجملة';
                          })()}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="m-price">
                    {calculateItemPrice(item, item.qty) * item.qty}ج
                  </div>
                </div>
              ))}
            </div>
            <div className="m-costs">
              <div className="cost-line">
                <span>الشحن:</span>
                <span>{shippingCost} ج</span>
              </div>
              <div className="cost-line total">
                <span>الإجمالي:</span>
                <span>{totalAmount} ج.م</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="m-form">
            <h2>بيانات التوصيل</h2>
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <label>الاسم بالكامل</label>
                <input 
                  type="text" 
                  required 
                  value={checkoutData.name} 
                  onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>رقم الموبايل (واتساب)</label>
                <input 
                  type="tel" 
                  required 
                  value={checkoutData.phone} 
                  onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} 
                />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>المحافظة</label>
                  <select 
                    required 
                    value={checkoutData.gov} 
                    onChange={e => setCheckoutData({...checkoutData, gov: e.target.value})}
                  >
                    <option value="">اختر...</option>
                    {Object.keys(SHIPPING_RATES).map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>المدينة/المنطقة</label>
                  <input 
                    type="text" 
                    required 
                    value={checkoutData.city} 
                    onChange={e => setCheckoutData({...checkoutData, city: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>العنوان بالتفصيل</label>
                <textarea 
                  required 
                  value={checkoutData.address} 
                  onChange={e => setCheckoutData({...checkoutData, address: e.target.value})}
                ></textarea>
              </div>
              <div className="input-group">
                <label>ملاحظات إضافية</label>
                <textarea 
                  value={checkoutData.notes} 
                  onChange={e => setCheckoutData({...checkoutData, notes: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="m-confirm" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الطلب 🔒'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
