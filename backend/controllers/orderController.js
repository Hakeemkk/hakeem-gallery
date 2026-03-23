const Order = require('../models/Order');
const {
  findByIdOrThrow,
  findByIdAndUpdate,
  findByIdAndDelete,
  buildFilter,
  buildSort,
  buildPagination,
  getPaginatedResults
} = require('../utils/databaseHelpers');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    // Build query, sort, and pagination from request parameters
    const filter = buildFilter(req.query, ['status', 'department']);
    const sort = buildSort(req.query, 'createdAt', 'desc');
    const pagination = buildPagination(req.query, 100);
    
    const { documents: orders, total, page, pages } = await getPaginatedResults(
      Order, 
      filter, 
      sort, 
      pagination
    );
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await findByIdOrThrow(Order, req.params.id);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res, next) => {
  try {
    // Validate required fields
    const { 
      customerName, 
      customerPhone, 
      customerGovernorate, 
      customerAddress, 
      items,
      totalPrice 
    } = req.body;
    
    if (!customerName || !customerPhone || !customerGovernorate || !customerAddress || !items || !totalPrice) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }
    
    // Calculate subtotal if not provided
    let subtotal = req.body.subtotal;
    if (!subtotal) {
      subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    
    // Create order
    const orderData = {
      ...req.body,
      subtotal,
      source: 'Website',
      status: req.body.status || 'جديد'
    };
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    res.status(201).json({
      success: true,
      data: savedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an order
// @route   PATCH /api/orders/:id
// @access  Private
const updateOrder = async (req, res, next) => {
  try {
    console.log(`📝 Updating order ${req.params.id}:`, req.body);
    
    // Prevent updating certain fields directly
    const restrictedFields = ['createdAt', '_id'];
    const updateData = { ...req.body };
    restrictedFields.forEach(field => delete updateData[field]);
    
    const order = await findByIdAndUpdate(Order, req.params.id, updateData);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log(`✅ Order updated successfully:`, order);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(`❌ Error updating order:`, error);
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res, next) => {
  try {
    await findByIdAndDelete(Order, req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order by short ID and phone
// @route   POST /api/orders/track
// @access  Public
const trackOrder = async (req, res, next) => {
  try {
    const { orderId, phone } = req.body;
    
    if (!orderId || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and phone number are required'
      });
    }
    
    // Find order by short ID (last 6 characters) and phone
    const orders = await Order.find({
      $and: [
        { _id: { $regex: orderId.slice(-6).toUpperCase(), $options: 'i' } },
        { customerPhone: { $regex: phone, $options: 'i' } }
      ]
    });
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Return the most recent match
    const order = orders[orders.length - 1];
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        status,
        ...(adminNote && { adminNote })
      }, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        byStatus: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  trackOrder,
  updateOrderStatus,
  getOrderStats
};
