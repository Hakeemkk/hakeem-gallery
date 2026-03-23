/**
 * Pricing utility functions for calculating product prices based on quantity tiers
 */

/**
 * Calculate the price of a product based on quantity and pricing tiers
 * @param {Object} product - Product object with pricing information
 * @param {number} quantity - Quantity of items
 * @returns {number} - Unit price based on quantity
 */
export const calculateItemPrice = (product, quantity) => {
  if (!product || !quantity || quantity <= 0) {
    return product?.price || 0;
  }

  // Check for tier 3 pricing (highest quantity tier)
  if (product.tier3Qty && quantity >= product.tier3Qty) {
    return product.tier3Price || product.price;
  }

  // Check for tier 2 pricing (medium quantity tier)
  if (product.tier2Qty && quantity >= product.tier2Qty) {
    return product.tier2Price || product.price;
  }

  // Default to base price
  return product.price;
};

/**
 * Calculate the total price for an array of items
 * @param {Array} items - Array of items with qty and product info
 * @returns {number} - Total price
 */
export const calculateSubtotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => {
    const unitPrice = calculateItemPrice(item, item.qty);
    return sum + (unitPrice * item.qty);
  }, 0);
};

/**
 * Check if a product has wholesale pricing
 * @param {Object} product - Product object
 * @returns {boolean} - True if product has wholesale pricing
 */
export const hasWholesalePricing = (product) => {
  return !!(product.tier2Qty || product.tier3Qty);
};

/**
 * Get the next wholesale tier for a product
 * @param {Object} product - Product object
 * @param {number} currentQuantity - Current quantity
 * @returns {Object|null} - Next tier info or null
 */
export const getNextWholesaleTier = (product, currentQuantity) => {
  if (!hasWholesalePricing(product)) {
    return null;
  }

  // Check if tier 2 is the next tier
  if (product.tier2Qty && currentQuantity < product.tier2Qty) {
    return {
      quantity: product.tier2Qty,
      price: product.tier2Price,
      remaining: product.tier2Qty - currentQuantity
    };
  }

  // Check if tier 3 is the next tier
  if (product.tier3Qty && currentQuantity < product.tier3Qty) {
    return {
      quantity: product.tier3Qty,
      price: product.tier3Price,
      remaining: product.tier3Qty - currentQuantity
    };
  }

  return null;
};

/**
 * Calculate wholesale progress percentage
 * @param {Object} product - Product object
 * @param {number} currentQuantity - Current quantity
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateWholesaleProgress = (product, currentQuantity) => {
  const nextTier = getNextWholesaleTier(product, currentQuantity);
  
  if (!nextTier) {
    return 100; // Already at or beyond wholesale tier
  }

  const previousTierThreshold = product.tier2Qty && currentQuantity >= product.tier2Qty 
    ? product.tier2Qty 
    : 0;

  const tierRange = nextTier.quantity - previousTierThreshold;
  const progressInRange = currentQuantity - previousTierThreshold;

  return Math.min(100, Math.max(0, (progressInRange / tierRange) * 100));
};
