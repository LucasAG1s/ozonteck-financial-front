import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://financial.ozonteck.cloud/api';

// Configuração base do Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
