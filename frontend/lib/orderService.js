import { api, endpoints } from './api';
import { WHATSAPP_NUMBER } from './constants';
import { validateCheckoutData } from '../utils/validationUtils';

export const orderService = {
  async createOrder(orderData) {
    try {
      const response = await api.post(endpoints.orders, orderData);
      return response.data || response;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  async getOrders() {
    try {
      const response = await api.get(endpoints.orders);
      return response.data || response || [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  async trackOrder(orderId, phone) {
    try {
      const response = await api.post(`${endpoints.orders}/track`, { orderId, phone });
      return response.data || response;
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  },

  generateWhatsAppLink(orderData, orderId) {
    const { customerName, customerGovernorate, totalPrice } = orderData;
    const shortId = orderId.slice(-6).toUpperCase();
    
    const message = encodeURIComponent(
      `أهلاً حكيم جاليري 👋\nقمت بتسجيل طلب جديد من الموقع:\n\nكود الطلب: #${shortId}\nالاسم: ${customerName}\nالمحافظة: ${customerGovernorate}\nالإجمالي: ${totalPrice} ج.م\n\nبرجاء تأكيد الطلب للبدء في التنفيذ.`
    );
    
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  },

  validateOrderData(checkoutData, items, totalAmount) {
    return validateCheckoutData(checkoutData, items, totalAmount);
  }
};
