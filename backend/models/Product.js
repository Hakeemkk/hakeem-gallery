const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, default: null },
  offerEnd: { type: Date, default: null },
  material: { type: String },
  duration: { type: String },
  desc: { type: String },
  img: { type: String, required: true }, // الصورة الرئيسية
  images: [{ type: String }], // الألبوم
  
  // أسعار الجملة
  tier2Qty: { type: Number, default: null },
  tier2Price: { type: Number, default: null },
  tier3Qty: { type: Number, default: null },
  tier3Price: { type: Number, default: null },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);