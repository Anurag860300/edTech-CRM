import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach custom JWT if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edtech_crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes('/auth/login');
      if (!isAuthRequest) {
        // Token expired or invalid
        localStorage.removeItem('edtech_crm_token');
        localStorage.removeItem('edtech_crm_admin');
        window.dispatchEvent(new Event('auth_token_expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginAdmin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Inquiry endpoints
export const submitPublicInquiry = async (formData) => {
  const response = await api.post('/inquiries', formData);
  return response.data;
};

export const fetchInquiries = async (params = {}) => {
  const response = await api.get('/inquiries', { params });
  return response.data;
};

export const fetchInquiryStats = async () => {
  const response = await api.get('/inquiries/stats');
  return response.data;
};

export const updateInquiryStatus = async (id, status, admin_notes) => {
  const response = await api.patch(`/inquiries/${id}/status`, { status, admin_notes });
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await api.delete(`/inquiries/${id}`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
