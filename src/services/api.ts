import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL,
});

// Interceptor para inyectar el token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('webadmin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
