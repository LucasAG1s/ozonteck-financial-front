import axios from 'axios';
import type { AxiosError } from 'axios';

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



export const handleApiError = (error: unknown, defaultMessage: string): never => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
            const data = axiosError.response.data as any;
            const status = axiosError.response.status;

            if (status === 422 && data && data.errors) {
                const firstErrorMessage = Object.values(data.errors)[0] as string[] | undefined;
                
                if (firstErrorMessage && firstErrorMessage.length > 0) {
                    throw new Error(firstErrorMessage[0]);
                }
                
                throw new Error(data.message || defaultMessage);
            }


            if (data && data.message) {
                throw new Error(data.message);
            }
        }
        
        if (axiosError.request) {
             throw new Error('Erro de conexão ou timeout. Verifique sua rede.');
        }

        throw new Error(defaultMessage);
    }
    if (error instanceof Error) {
        throw error;
    }
    
    throw new Error('Ocorreu um erro inesperado.');
};



export default api;
