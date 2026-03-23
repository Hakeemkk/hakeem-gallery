const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // في Development: اسمح بـ localhost و Docker services
    if (process.env.NODE_ENV !== 'production') {
      const devOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3030',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3030',
        'http://frontend:3000', // Docker service name
      ];
      
      // اسمح بأي localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('frontend')) {
        return callback(null, true);
      }
      
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // في Production: اسمح بـ origins محددة فقط
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = [
        process.env.FRONTEND_URL,
        'https://yourdomain.com'
      ].filter(Boolean);
      
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Allow all in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
