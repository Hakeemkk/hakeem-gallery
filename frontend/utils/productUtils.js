/**
 * Product utility functions for validation and formatting
 */

/**
 * Validate product data
 * @param {Object} productData - Product data to validate
 * @returns {Array} - Array of validation error messages
 */
export const validateProductData = (productData) => {
  const errors = [];
  
  // Validate required fields
  if (!productData.title?.trim()) {
    errors.push('Product title is required');
  }
  
  if (!productData.category) {
    errors.push('Product category is required');
  }
  
  if (!productData.price || isNaN(productData.price) || parseFloat(productData.price) <= 0) {
    errors.push('Price must be a positive number');
  }
  
  if (!productData.img?.trim()) {
    errors.push('Product image is required');
  }
  
  // Validate title length
  if (productData.title && productData.title.length < 3) {
    errors.push('Product title must be at least 3 characters long');
  }
  
  // Validate category
  const validCategories = ['laser', 'print', 'gifts', 'wedding'];
  if (productData.category && !validCategories.includes(productData.category)) {
    errors.push('Invalid product category');
  }
  
  // Validate wholesale pricing
  if (productData.tier2Qty && productData.tier2Price) {
    if (isNaN(productData.tier2Qty) || parseInt(productData.tier2Qty) <= 0) {
      errors.push('Tier 2 quantity must be a positive number');
    }
    
    if (isNaN(productData.tier2Price) || parseFloat(productData.tier2Price) <= 0) {
      errors.push('Tier 2 price must be a positive number');
    }
    
    if (parseFloat(productData.tier2Price) >= parseFloat(productData.price)) {
      errors.push('Tier 2 price must be less than regular price');
    }
  }
  
  // Validate URL if provided
  if (productData.img && !isValidUrl(productData.img)) {
    errors.push('Invalid image URL format');
  }
  
  return errors;
};

/**
 * Check if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Format product data for API submission
 * @param {Object} formData - Raw form data
 * @returns {Object} - Formatted product data
 */
export const formatProductData = (formData) => {
  return {
    title: formData.title?.trim() || '',
    category: formData.category || 'laser',
    price: parseFloat(formData.price) || 0,
    img: formData.img?.trim() || '',
    tier2Qty: formData.tier2Qty ? parseInt(formData.tier2Qty) : null,
    tier2Price: formData.tier2Price ? parseFloat(formData.tier2Price) : null,
    tier3Qty: formData.tier3Qty ? parseInt(formData.tier3Qty) : null,
    tier3Price: formData.tier3Price ? parseFloat(formData.tier3Price) : null,
  };
};

/**
 * Get category display name
 * @param {string} category - Category code
 * @returns {string} - Display name
 */
export const getCategoryName = (category) => {
  const categoryNames = {
    laser: 'ليزر',
    print: 'طباعة',
    gifts: 'هدايا',
    wedding: 'مناسبات',
  };
  
  return categoryNames[category] || category;
};

/**
 * Reset product form to default values
 * @returns {Object} - Default form values
 */
export const getDefaultProductForm = () => {
  return {
    title: '',
    price: '',
    category: 'laser',
    img: '',
    tier2Qty: '',
    tier2Price: '',
    tier3Qty: '',
    tier3Price: '',
  };
};
