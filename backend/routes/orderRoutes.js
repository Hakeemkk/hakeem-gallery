const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  trackOrder,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');

// Non-parameterized routes must come FIRST
// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private
router.get('/stats', getOrderStats);

// @route   POST /api/orders/track
// @desc    Track order by ID and phone
// @access  Public
router.post('/track', trackOrder);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', getOrders);

// @route   POST /api/orders
// @desc    Create an order
// @access  Public
router.post('/', createOrder);

// Parameterized routes come AFTER non-parameterized routes
// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', getOrder);

// @route   PATCH /api/orders/:id
// @desc    Update an order
// @access  Private
router.patch('/:id', updateOrder);

// @route   PUT /api/orders/:id
// @desc    Update an order (alternative to PATCH)
// @access  Private
router.put('/:id', updateOrder);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/:id/status', updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', deleteOrder);

module.exports = router;