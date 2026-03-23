/**
 * Validation utility functions for forms and data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Egyptian phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Egyptian phone number
 */
export const isValidEgyptianPhone = (phone) => {
  // Egyptian phone numbers: 10-15 digits, starting with 0 or +20
  const phoneRegex = /^(?:\+20|0)?1[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate required fields in an object
 * @param {Object} data - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} - Array of error messages for missing fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
};

/**
 * Validate checkout form data
 * @param {Object} checkoutData - Checkout form data
 * @param {Array} items - Cart items
 * @param {number} totalAmount - Total amount
 * @returns {Array} - Array of validation error messages
 */
export const validateCheckoutData = (checkoutData, items, totalAmount) => {
  const errors = [];
  
  // Validate required fields
  const requiredFields = ['name', 'phone', 'gov', 'city', 'address'];
  const fieldErrors = validateRequiredFields(checkoutData, requiredFields);
  errors.push(...fieldErrors);
  
  // Validate phone format
  if (checkoutData.phone && !isValidEgyptianPhone(checkoutData.phone)) {
    errors.push('Invalid Egyptian phone number format');
  }
  
  // Validate items
  if (!items || items.length === 0) {
    errors.push('Cart must contain at least one item');
  }
  
  // Validate total amount
  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    errors.push('Invalid total amount');
  }
  
  // Validate name length
  if (checkoutData.name && checkoutData.name.length < 3) {
    errors.push('Name must be at least 3 characters long');
  }
  
  // Validate address length
  if (checkoutData.address && checkoutData.address.length < 10) {
    errors.push('Address must be at least 10 characters long');
  }
  
  return errors;
};

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/[<>]/g, ''); // Remove angle brackets
};

/**
 * Validate product data
 * @param {Object} productData - Product data to validate
 * @returns {Array} - Array of validation error messages
 */
export const validateProductData = (productData) => {
  const errors = [];
  
  // Validate required fields
  const requiredFields = ['title', 'category', 'price', 'img'];
  const fieldErrors = validateRequiredFields(productData, requiredFields);
  errors.push(...fieldErrors);
  
  // Validate price
  if (productData.price && (isNaN(productData.price) || parseFloat(productData.price) <= 0)) {
    errors.push('Price must be a positive number');
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
  
  // Validate title length
  if (productData.title && productData.title.length < 3) {
    errors.push('Product title must be at least 3 characters long');
  }
  
  // Validate category
  const validCategories = ['laser', 'print', 'gifts', 'wedding'];
  if (productData.category && !validCategories.includes(productData.category)) {
    errors.push('Invalid product category');
  }
  
  return errors;
};

/**
 * Validate search query
 * @param {string} query - Search query string
 * @returns {string} - Sanitized and validated search query
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  
  return sanitizeString(query).substring(0, 100); // Limit to 100 characters
};
