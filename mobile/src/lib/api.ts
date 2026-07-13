import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';

// Change this IP to match your local development machine IP if needed
export const API_HOST = '192.168.37.66';
export const API_URL = `http://${API_HOST}:5000`;
export const WS_URL = `http://${API_HOST}:5000`;

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('autoupi_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth storage helpers
export async function saveAuthData(token: string, user: any) {
  try {
    await SecureStore.setItemAsync('autoupi_token', token);
    await SecureStore.setItemAsync('autoupi_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving auth credentials:', error);
  }
}

export async function clearAuth() {
  try {
    await SecureStore.deleteItemAsync('autoupi_token');
    await SecureStore.deleteItemAsync('autoupi_user');
  } catch (error) {
    console.error('Error clearing auth credentials:', error);
  }
}

export async function getStoredToken() {
  return await SecureStore.getItemAsync('autoupi_token');
}

export async function getStoredUser() {
  const userStr = await SecureStore.getItemAsync('autoupi_user');
  return userStr ? JSON.parse(userStr) : null;
}

export async function isAuthenticated() {
  const token = await getStoredToken();
  return !!token;
}

// Socket Connection Helper
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// API endpoint mappings
export const authApi = {
  requestOTP: (phone: string, email: string) =>
    api.post('/auth/request-otp', { phone, email }),
  verifyOTP: (phone: string, email: string, fullName: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, email, fullName, otp }),
  getMe: () => api.get('/auth/me'),
};

export const transactionApi = {
  initiate: (data: {
    amount: number;
    currency: string;
    targetCurrency: string;
    recipientId: string;
    recipientName: string;
  }) => api.post('/transactions/initiate', data),
  get: (id: string) => api.get(`/transactions/${id}`),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/transactions/history?page=${page}&limit=${limit}`),
  getRates: () => api.get('/rates'),
};
