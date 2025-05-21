import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fit.tvcoosanjer.com.gt/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
