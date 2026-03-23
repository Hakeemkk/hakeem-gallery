/**
 * Mock Data Provider for Testing (Development Only)
 * Used to test data persistence and updates without backend
 */

// يمكن استخدام هذا الملف للاختبار أثناء التطوير
// في الإنتاج، يجب استخدام الخادم الحقيقي

export const mockProducts = [
  {
    _id: '1',
    title: 'تصميم حزام جلد بالليزر',
    category: 'laser',
    price: 150,
    img: 'https://via.placeholder.com/300x300?text=Leather+Belt',
    tier2Qty: 10,
    tier2Price: 120,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'هدية خشبية مخصصة',
    category: 'gifts',
    price: 200,
    img: 'https://via.placeholder.com/300x300?text=Wooden+Gift',
    createdAt: new Date().toISOString()
  }
];

// Simple in-memory data store for development/testing
let devProducts = [...mockProducts];

export const mockAPI = {
  // Get all products
  async getProducts() {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    return {
      success: true,
      count: devProducts.length,
      total: devProducts.length,
      page: 1,
      pages: 1,
      data: devProducts
    };
  },

  // Create product
  async createProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newProduct = {
      _id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    devProducts.push(newProduct);
    
    return {
      success: true,
      data: newProduct
    };
  },

  // Update product
  async updateProduct(id, productData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = devProducts.findIndex(p => p._id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const updated = { ...devProducts[index], ...productData };
    devProducts[index] = updated;
    
    return {
      success: true,
      data: updated
    };
  },

  // Delete product
  async deleteProduct(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = devProducts.findIndex(p => p._id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    devProducts.splice(index, 1);
    
    return {
      success: true,
      data: {}
    };
  }
};
