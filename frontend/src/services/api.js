import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://finance-tracker-backend.onrender.com' : 'http://localhost:3001'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
}

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/api/transactions', { params }),
  create: (data) => api.post('/api/transactions', data),
  update: (id, data) => api.put(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
  getCategories: () => api.get('/api/transactions/categories'),
}

// Budgets API
export const budgetsAPI = {
  getAll: (params) => api.get('/api/budgets', { params }),
  create: (data) => api.post('/api/budgets', data),
  update: (id, data) => api.put(`/api/budgets/${id}`, data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
}

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/api/reports/dashboard'),
  getSpendingByCategory: (params) => api.get('/api/reports/spending-by-category', { params }),
  getMonthlyTrends: () => api.get('/api/reports/monthly-trends'),
  getCalendarData: (params) => api.get('/api/reports/calendar', { params }),
}

// AI API (Premium features)
export const aiAPI = {
  scanReceipt: (formData) => api.post('/api/ai/scan-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  categorizeTransaction: (data) => api.post('/api/ai/categorize-transaction', data),
  predictBudget: (params) => api.get('/api/ai/predict-budget', { params }),
}

// Subscriptions API
export const subscriptionsAPI = {
  create: () => api.post('/api/subscriptions/create'),
  getStatus: () => api.get('/api/subscriptions/status'),
  cancel: () => api.post('/api/subscriptions/cancel'),
}

export default api