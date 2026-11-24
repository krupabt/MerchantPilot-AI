import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mp_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const signUp = (data) => api.post('/auth/signup', data);
export const signIn = (data) => api.post('/auth/signin', data);
export const getCurrentUser = () => api.get('/auth/me');
export const updateCurrentUser = (data) => api.put('/auth/me', data);
export const logoutUser = () => api.post('/auth/logout');

// Merchant Portal APIs
export const getMerchantStats = () => api.get('/dashboard/stats');
export const getMerchantProducts = (params) => api.get('/merchant/products', { params });
export const createMerchantProduct = (data) => api.post('/merchant/products', data);
export const updateMerchantProduct = (id, data) => api.put(`/merchant/products/${id}`, data);
export const archiveMerchantProduct = (id) => api.delete(`/merchant/products/${id}`);
export const updateProductStock = (id, stock) => api.post(`/merchant/products/${id}/stock`, { stock });
export const updateMerchantStock = updateProductStock;
export const getMerchantOrders = (params) => api.get('/merchant/orders', { params });
export const getMerchantOrderDetails = (id) => api.get(`/merchant/orders/${id}`);
export const updateOrderFulfillment = (id, fulfillment_status) =>
  api.put(`/merchant/orders/${id}/fulfillment`, { fulfillment_status });
export const getMerchantCategories = () => api.get('/merchant/categories');
export const createMerchantCategory = (data) => api.post('/merchant/categories', data);

// Customer Storefront & Cart APIs
export const getCustomerCart = () => api.get('/customer/cart');
export const addToCustomerCart = (data) => api.post('/customer/cart/items', data);
export const updateCustomerCartItem = (itemId, quantity) => api.put(`/customer/cart/items/${itemId}`, { quantity });
export const removeCustomerCartItem = (itemId) => api.delete(`/customer/cart/items/${itemId}`);
export const clearCustomerCart = () => api.delete('/customer/cart');
export const getCustomerOrders = () => api.get('/customer/orders');
export const getCustomerOrderDetails = (id) => api.get(`/customer/orders/${id}`);

// Agent APIs
export const getAgentCatalog = (params) => api.get('/agent/catalog', { params });
export const getAgentProduct = (id) => api.get(`/agent/products/${id}`);
export const checkAgentAvailability = (product_ids) => api.post('/agent/availability', { product_ids });
export const getAgentPolicies = () => api.get('/agent/policies');
export const postAgentChat = (data) => api.post('/agent/chat', data);

// Products APIs
export const listProducts = (params) => api.get('/products', { params });
export const getProductDetails = (id) => api.get(`/products/${id}`);

// Revenue Intelligence APIs
export const getRevenueInsights = () => api.get('/revenue/insights');
export const getProductRecommendations = (productId) => api.get(`/revenue/recommendations/${productId}`);

// Policies APIs
export const getPolicies = () => api.get('/policies');
export const updatePolicy = (policyData) => api.put('/policies', policyData);
export const validatePolicy = (validationData) => api.post('/policies/validate', validationData);

// Checkout & Razorpay Settlement APIs
export const createCheckoutOrder = (orderData) => api.post('/checkout/create-order', orderData);
export const verifyRazorpayPayment = (paymentData) => api.post('/razorpay/verify-payment', paymentData);

// Audit Trail APIs
export const getAuditLogs = (params) => api.get('/audit/logs', { params });

// Dashboard Stats & Transactions
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getTransactions = () => api.get('/dashboard/transactions');

// AI Assistant APIs
export const postMerchantAIAssistant = (payload) => {
  if (typeof payload === 'string') {
    return api.post('/merchant/ai-assistant', { query: payload });
  }
  return api.post('/merchant/ai-assistant', payload);
};

// Merchant Intelligence & Action Center APIs
export const getSalesPeriodComparison = (days = 7) => api.get('/merchant/analytics/period-comparison', { params: { days } });
export const getInventoryIntelligence = (targetBufferDays = 30) => api.get('/merchant/inventory/intelligence', { params: { target_buffer_days: targetBufferDays } });
export const getMerchantActions = (status) => api.get('/merchant/actions', { params: status ? { status } : {} });
export const generateMerchantActions = () => api.post('/merchant/actions/generate');
export const approveMerchantAction = (actionId) => api.post(`/merchant/actions/${actionId}/approve`);
export const rejectMerchantAction = (actionId) => api.post(`/merchant/actions/${actionId}/reject`);

export default api;
