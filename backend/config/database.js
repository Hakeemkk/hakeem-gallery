const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // استخدم متغير البيئة مع fallback آمن
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hakeem_db';
    
    console.log(`📡 Attempting to connect to MongoDB: ${mongoURI}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 ثوانٍ
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // معالجة أخطاء الاتصال
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // الإغلاق الآمن
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // إعادة محاولة الاتصال بعد 5 ثوانٍ
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
