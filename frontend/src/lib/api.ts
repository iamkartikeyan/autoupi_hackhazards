import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('autoupi_token') || (typeof window !== 'undefined' ? localStorage.getItem('autoupi_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('autoupi_token');
      localStorage.removeItem('autoupi_token');
      localStorage.removeItem('autoupi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  requestOTP: (phone: string, email: string) => api.post('/auth/request-otp', { phone, email }),
  verifyOTP: (phone: string, email: string, fullName: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, email, fullName, otp }),
  loginPassword: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  registerPassword: (phone: string, email: string, fullName: string, password: string) =>
    api.post('/auth/register', { phone, email, fullName, password }),
  getMe: () => api.get('/auth/me'),
};

// Transactions
export const transactionApi = {
  initiate: (data: {
    amount: number;
    currency: string;
    targetCurrency: string;
    recipientId: string;
    recipientName: string;
  }) => api.post('/transactions/initiate', data),
  get: (id: string) => api.get(`/transactions/${id}`),
  getHistory: (page = 1, limit = 10) => api.get(`/transactions/history?page=${page}&limit=${limit}`),
  getRates: () => api.get('/rates'),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPools: () => api.get('/admin/pools'),
  getTransactions: (page = 1) => api.get(`/admin/transactions?page=${page}`),
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  rebalancePool: (currency: string, amount: number) => api.post('/admin/pools/rebalance', { currency, amount }),
};

// Save auth data
export function saveAuthData(token: string, user: Record<string, unknown>) {
  Cookies.set('autoupi_token', token, { expires: 7, secure: true, sameSite: 'lax' });
  if (typeof window !== 'undefined') {
    localStorage.setItem('autoupi_token', token);
    localStorage.setItem('autoupi_user', JSON.stringify(user));
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('autoupi_user');
  return stored ? JSON.parse(stored) : null;
}

export function clearAuth() {
  Cookies.remove('autoupi_token');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('autoupi_token');
    localStorage.removeItem('autoupi_user');
  }
}

export function isAuthenticated() {
  return !!Cookies.get('autoupi_token');
}
