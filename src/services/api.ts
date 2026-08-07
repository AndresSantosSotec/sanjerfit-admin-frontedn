import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // NO establecer Content-Type por defecto aquí
});

// Interceptor para inyectar el token y manejar Content-Type
api.interceptors.request.use(config => {
  // Agregar token de autenticación
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // IMPORTANTE: Manejar Content-Type según el tipo de data
  if (config.data instanceof FormData) {
    // Para FormData, NO establecer Content-Type
    // El navegador lo establecerá automáticamente con el boundary correcto
    delete config.headers['Content-Type'];
    
    // Debug: mostrar contenido del FormData (opcional)
    console.log('Enviando FormData:', Array.from(config.data.entries()));
  } else {
    // Para requests JSON normales
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Interceptor adicional para manejar PUT con FormData (Laravel requirement)
api.interceptors.request.use((config) => {
  if (config.method === 'put' && config.data instanceof FormData) {
    // Laravel necesita _method=PUT para procesar FormData en rutas PUT
    config.data.append('_method', 'PUT');
    // Cambiar a POST para que Laravel lo procese correctamente
    config.method = 'post';
  }
  return config;
});

// Interceptor de respuesta global para manejar la expiración del token (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('last_activity_ts');
      
      // Redirigir al login forzando la recarga para limpiar estados de React Router
      const baseUrl = import.meta.env.BASE_URL || '/webadmin';
      window.location.href = `${baseUrl}/login`;
    }
    return Promise.reject(error);
  }
);

export default api;