# Hakeem Gallery Backend API

A modern, scalable backend API for the Hakeem Gallery e-commerce platform built with Express.js and MongoDB.

## Features

- 🚀 RESTful API design
- 📦 Product management with categories
- 🛒 Order processing and tracking
- 📁 File upload handling
- 🔍 Advanced filtering and pagination
- 🛡️ Error handling and validation
- 📊 Order statistics and analytics
- 🌍 CORS support
- 📝 Environment-based configuration

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **Dotenv** - Environment variables

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── productController.js # Product logic
│   └── orderController.js   # Order logic
├── middleware/
│   ├── errorHandler.js      # Error handling
│   └── upload.js           # File upload middleware
├── models/
│   ├── Product.js          # Product model
│   └── Order.js            # Order model
├── routes/
│   ├── productRoutes.js    # Product routes
│   ├── orderRoutes.js      # Order routes
│   └── uploadRoutes.js     # File upload routes
├── uploads/                # File uploads directory
├── server.js              # Main server file
├── package.json
└── .env.example           # Environment variables template
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Products

- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get product categories
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `GET /api/orders` - Get all orders (with filtering, pagination)
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/stats` - Get order statistics
- `POST /api/orders` - Create new order
- `POST /api/orders/track` - Track order by ID and phone
- `PATCH /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### File Upload

- `POST /api/upload` - Upload general file
- `POST /api/upload/design` - Upload design file

### Health Check

- `GET /health` - Server health check

## Query Parameters

### Products

- `category` - Filter by category
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc, default: desc)
- `limit` - Number of results (default: 50)

### Orders

- `status` - Filter by status
- `department` - Filter by department
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc, default: desc)
- `limit` - Number of results (default: 100)
- `page` - Page number (default: 1)

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

See `.env.example` for all available environment variables.

## Development

The server includes hot-reload functionality with nodemon for development.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URI
3. Set up proper CORS origins
4. Use a process manager like PM2

## License

MIT
