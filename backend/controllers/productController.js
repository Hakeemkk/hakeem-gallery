const Product = require('../models/Product');
const {
  findByIdOrThrow,
  findByIdAndUpdate,
  findByIdAndDelete,
  buildFilter,
  buildSort,
  buildPagination,
  getPaginatedResults
} = require('../utils/databaseHelpers');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    // Build query, sort, and pagination from request parameters
    const filter = buildFilter(req.query, ['category']);
    const sort = buildSort(req.query, 'createdAt', 'desc');
    const pagination = buildPagination(req.query, 50);
    
    const { documents: products, total, page, pages } = await getPaginatedResults(
      Product, 
      filter, 
      sort, 
      pagination
    );
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await findByIdOrThrow(Product, req.params.id);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (should be protected in production)
const createProduct = async (req, res, next) => {
  try {
    // Validate required fields
    const { title, category, price, img } = req.body;
    
    if (!title || !category || !price || !img) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, category, price, and image'
      });
    }
    
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await findByIdAndUpdate(Product, req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    await findByIdAndDelete(Product, req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
