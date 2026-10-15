import axios from 'axios';

export const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
    // In local development (npm run dev), use local proxy '/api' to localhost:8080
    // In production (Vercel), default to the deployed Render backend
    url = import.meta.env.DEV ? '/api' : 'https://society-backendd.onrender.com/api';
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api') && url.startsWith('http')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/'; 
  }
  return Promise.reject(error);
});

export default api;
