// API configuration and utilities
const getApiBaseUrl = () => {
  // In browser environment, use the NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  // Server-side, use backend service name for Docker container communication
  return 'http://backend:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Export for debugging
export { API_BASE_URL };

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      console.error(`❌ API Error: ${errMsg}`);
      throw new ApiError(errMsg, response.status);
    }
    
    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Fetch error:`, error);
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      const detailedMsg = `Network error: ${error.message || error.toString()}. Make sure the backend is running at ${API_BASE_URL}`;
      throw new ApiError(detailedMsg);
    }
    
    // Handle request cancellation/timeout
    if (error.name === 'AbortError') {
      throw new ApiError('Request was cancelled or timed out.');
    }
    
    // Handle other network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      throw new ApiError('Network error. Please check your connection.');
    }
    
    // Generic error
    throw new ApiError(error.message || 'An unexpected error occurred.');
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};

export const endpoints = {
  products: '/products',
  orders: '/orders',
  upload: '/upload',
};

export { ApiError };
