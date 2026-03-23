import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      
      // Handle different response structures from backend
      // Server returns: { success: true, data: [...], count, total, page, pages }
      let productsData = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      const errorMsg = err.message || err.toString() || 'Failed to fetch products';
      setError(`⚠️ ${errorMsg}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      console.log('📝 Creating product:', productData);
      const response = await api.post('/products', productData);
      const newProduct = response.data || response;
      console.log('✅ Product created:', newProduct);
      // إعادة جلب البيانات من الخادم للتأكد من التحديث الصحيح
      await fetchProducts();
      return newProduct;
    } catch (err) {
      console.error('❌ Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      const updatedProduct = response.data || response;
      // إعادة جلب البيانات من الخادم للتأكد من التحديث الصحيح
      await fetchProducts();
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      // إعادة جلب البيانات من الخادم للتأكد من التحديث الصحيح
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
