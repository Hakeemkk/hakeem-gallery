import { useState, useEffect } from 'react';
import { SHIPPING_DEADLINE } from '../lib/constants';

export const useShippingTimer = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = SHIPPING_DEADLINE - now;
      
      if (diff > 0) {
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setMessage(
          `⏳ تنبيه: سيتم إيقاف شحن المحافظات لإجازة العيد خلال (${hours} ساعة و ${minutes} دقيقة) .. ولكن المحل متاح للاستلام!`
        );
      } else {
        setMessage("🎉 عيد سعيد! شحن المحافظات متوقف حالياً.. نراكم بعد الإجازة 🎉");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return message;
};
