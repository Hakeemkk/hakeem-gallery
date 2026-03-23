import { useState, useCallback } from 'react';
import { SHIPPING_RATES, TOAST_DURATION } from '../lib/constants';
import { calculateItemPrice, calculateSubtotal, calculateWholesaleProgress, getNextWholesaleTier } from '../utils/pricingUtils';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const getItemPrice = useCallback((product, quantity) => {
    return calculateItemPrice(product, quantity);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    
    setToast(`🛒 أضفنا "${product.title}" للسلة`);
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const updateQuantity = useCallback((id, change) => {
    setCart(prev => prev.map(item => 
      item._id === id 
        ? { ...item, qty: Math.max(1, item.qty + change) } 
        : item
    ));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getSubtotal = useCallback((items = cart) => {
    return calculateSubtotal(items);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.qty, 0);
  }, [cart]);

  return {
    cart,
    toast,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemPrice,
    getSubtotal,
    getCartCount,
    setToast
  };
};
