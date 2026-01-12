import axios from 'axios';

// Since we have microservices on different ports, we'll define base URLs for each
// In a production environment, these would likely be routed via an API Gateway (e.g. /api/v1/auth -> auth-service)

export const AUTH_API_URL = 'http://localhost:8081/api/v1/auth';
export const ORDER_API_URL = 'http://localhost:8080/api/v1/orders';

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderApi = axios.create({
  baseURL: ORDER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
const addTokenInterceptor = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addTokenInterceptor);
orderApi.interceptors.request.use(addTokenInterceptor);
