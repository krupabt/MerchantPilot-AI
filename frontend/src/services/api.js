import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
export const logoutUser = () => api.post('/auth/logout');

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

export default api;
