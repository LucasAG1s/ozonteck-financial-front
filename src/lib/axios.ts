import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://financial.ozonteck.cloud/api';

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



export const handleApiError = (error: unknown, defaultMessage: string): never  => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const apiMessage = error.response.data?.message;
      if (apiMessage) {
        throw new Error(apiMessage);
      }
    }
    throw new Error('Ocorreu um erro inesperado de comunicação');
  }
  throw new Error('Ocorreu um erro inesperado');
};



export default api;
