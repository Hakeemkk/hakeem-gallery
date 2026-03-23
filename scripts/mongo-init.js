// MongoDB initialization script
// This script runs when the database container first starts

// Switch to the application database
db = db.getSiblingDB('hakeem_db');

// Create collections with validation
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'category', 'price', 'img'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          description: 'Product title must be at least 3 characters long'
        },
        category: {
          bsonType: 'string',
          enum: ['laser', 'print', 'gifts', 'wedding'],
          description: 'Product category must be one of the predefined values'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Price must be a positive number'
        },
        img: {
          bsonType: 'string',
          description: 'Product image URL is required'
        },
        tier2Qty: {
          bsonType: 'number',
          minimum: 1,
          description: 'Tier 2 quantity must be a positive number'
        },
        tier2Price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Tier 2 price must be a positive number'
        },
        tier3Qty: {
          bsonType: 'number',
          minimum: 1,
          description: 'Tier 3 quantity must be a positive number'
        },
        tier3Price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Tier 3 price must be a positive number'
        }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customerName', 'customerPhone', 'customerGovernorate', 'customerAddress', 'items', 'totalPrice'],
      properties: {
        customerName: {
          bsonType: 'string',
          minLength: 3,
          description: 'Customer name must be at least 3 characters long'
        },
        customerPhone: {
          bsonType: 'string',
          pattern: '^(?:\\+20|0)?1[0-9]{9}$',
          description: 'Must be a valid Egyptian phone number'
        },
        customerGovernorate: {
          bsonType: 'string',
          minLength: 2,
          description: 'Governorate is required'
        },
        customerAddress: {
          bsonType: 'string',
          minLength: 10,
          description: 'Address must be at least 10 characters long'
        },
        items: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['title', 'qty', 'price'],
            properties: {
              title: { bsonType: 'string', minLength: 1 },
              qty: { bsonType: 'number', minimum: 1 },
              price: { bsonType: 'number', minimum: 0 }
            }
          }
        },
        totalPrice: {
          bsonType: 'number',
          minimum: 0,
          description: 'Total price must be a positive number'
        },
        status: {
          bsonType: 'string',
          enum: ['جديد', 'تصميم', 'إنتاج', 'جاهز للتسليم', 'تم التسليم'],
          description: 'Order status must be one of the predefined values'
        }
      }
    }
  }
});

// Create indexes for better performance
db.products.createIndex({ title: 'text', category: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });

db.orders.createIndex({ customerPhone: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ department: 1 });
db.orders.createIndex({ totalPrice: 1 });

// Create a default admin user (for development only)
if (db.getMongo().useDb('admin').getUsers().length === 0) {
  db.getMongo().useDb('admin').createUser({
    user: 'admin',
    pwd: 'secure_password_change_in_production',
    roles: ['readWrite', 'dbAdmin']
  });
}

print('Database initialization completed successfully!');
