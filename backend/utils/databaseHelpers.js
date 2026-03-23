/**
 * Database utility functions to reduce duplication across controllers
 */

/**
 * Find a document by ID and handle 404 error
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Found document
 * @throws {Error} - If document not found
 */
const findByIdOrThrow = async (Model, id) => {
  const document = await Model.findById(id);
  if (!document) {
    const error = new Error(`${Model.modelName} not found`);
    error.statusCode = 404;
    throw error;
  }
  return document;
};

/**
 * Update a document by ID with validation
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} updateData - Data to update
 * @param {Object} options - Mongoose update options
 * @returns {Promise<Object>} - Updated document
 */
const findByIdAndUpdate = async (Model, id, updateData, options = {}) => {
  const defaultOptions = {
    new: true,
    runValidators: true,
    ...options
  };

  return await Model.findByIdAndUpdate(id, updateData, defaultOptions);
};

/**
 * Delete a document by ID with validation
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @returns {Promise<Object>} - Deleted document
 */
const findByIdAndDelete = async (Model, id) => {
  const document = await findByIdOrThrow(Model, id);
  await Model.deleteOne({ _id: id });
  return document;
};

/**
 * Build query filter from request query parameters
 * @param {Object} query - Express request query object
 * @param {Array} allowedFilters - Array of allowed filter fields
 * @returns {Object} - MongoDB filter object
 */
const buildFilter = (query, allowedFilters = []) => {
  const filter = {};
  
  allowedFilters.forEach(field => {
    if (query[field] && query[field] !== 'all') {
      filter[field] = query[field];
    }
  });

  return filter;
};

/**
 * Build sort options from request query parameters
 * @param {Object} query - Express request query object
 * @param {string} defaultSort - Default sort field
 * @param {string} defaultOrder - Default sort order ('asc' or 'desc')
 * @returns {Object} - MongoDB sort object
 */
const buildSort = (query, defaultSort = 'createdAt', defaultOrder = 'desc') => {
  const sortField = query.sort || defaultSort;
  const sortOrder = query.order || defaultOrder;
  
  return {
    [sortField]: sortOrder === 'desc' ? -1 : 1
  };
};

/**
 * Build pagination options from request query parameters
 * @param {Object} query - Express request query object
 * @param {number} defaultLimit - Default limit for pagination
 * @returns {Object} - Pagination options
 */
const buildPagination = (query, defaultLimit = 50) => {
  const limit = parseInt(query.limit) || defaultLimit;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  return { limit, page, skip };
};

/**
 * Get paginated results with metadata
 * @param {Model} Model - Mongoose model
 * @param {Object} filter - MongoDB filter
 * @param {Object} sort - MongoDB sort options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Paginated results with metadata
 */
const getPaginatedResults = async (Model, filter, sort, pagination) => {
  const { limit, page, skip } = pagination;
  
  const [documents, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit),
    Model.countDocuments(filter)
  ]);

  return {
    documents,
    total,
    page,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

module.exports = {
  findByIdOrThrow,
  findByIdAndUpdate,
  findByIdAndDelete,
  buildFilter,
  buildSort,
  buildPagination,
  getPaginatedResults
};
