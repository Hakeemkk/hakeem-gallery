const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerGovernorate: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{
    title: String,
    qty: Number,
    price: Number
  }],
  subtotal: Number,
  shippingCost: Number,
  totalPrice: Number,
  source: { type: String, default: 'Website' },
  
  // حقول الـ ERP الجديدة
  status: { type: String, default: 'جديد' }, // جديد -> جاري التصميم -> في الإنتاج -> جاهز للتسليم -> تم التسليم
  department: { type: String, default: 'غير محدد' }, // ليزر، مطبعة، هدايا
  designLink: { type: String, default: '' }, // رابط ملف التصميم (درايف مثلا)
  fileLink: { type: String, default: '' }, // رابط بديل لملفات التصميم (درايف، ميديافاير، إلخ)
  adminNote: { type: String, default: '' }, // ملاحظات الورشة والمقاسات
  
  // 🔥 حقول الملفات المتعددة
  uploadedFiles: [{
    name: { type: String, default: '' },        // اسم الملف
    size: { type: Number, default: 0 },         // حجم الملف بالبايت
    url: { type: String, required: true },      // رابط الملف المرفوع
    uploadedAt: { type: Date, default: Date.now } // تاريخ الرفع
  }],
  
  // 🔥 البيانات الإضافية
  dimensions: { type: String, default: '' },    // المقاسات (20x30 سم)
  material: { type: String, default: '' },      // نوع الخامة (خشب، أكريليك، إلخ)
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);