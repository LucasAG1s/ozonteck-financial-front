import { z } from 'zod';
import api from '../axios';
import axios, { AxiosError } from 'axios';


export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginData = z.infer<typeof loginSchema>;

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string | null;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  login: string;
  name: string;
  status: number;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  avatar:string | null;
}

export interface AuthResponse {
  token: string;
  user?: User;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

const handleApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
            const data = axiosError.response.data as any;
            const status = axiosError.response.status;
            let apiMessage = 'Ocorreu um erro inesperado de comunicação';
            let errorCode: string | undefined;

            if (data) {
                if (data.error && data.error.message) {
                    apiMessage = data.error.message;
                    errorCode = data.error.code;
                } 
                else if (status === 422 && data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey) {
                        apiMessage = data.errors[firstErrorKey][0] || apiMessage;
                    }
                }
                else if (data.message) {
                    apiMessage = data.message;
                }
            }

            return {
                message: apiMessage,
                code: errorCode,
                status: status,
                details: data,
            };
        }
        
        if (axiosError.message) {
            return {
                message: axiosError.message, 
            };
        }
    }

    if (error instanceof Error) {
        return { message: error.message };
    }

    return { message: 'Erro desconhecido. Verifique o console.' };
};


class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const validatedData = loginSchema.parse(data);
      const response = await api.post<{ token: string }>('api/auth/login', validatedData);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        token: response.data.token,
      };
    } catch (error:unknown) {
      throw handleApiError(error as Error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<{ data: User }>('api/user/me');
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Token de refresh não encontrado');
      }

      const response = await api.post<{ token: string }>('/auth/refresh', {
        refreshToken,
      });

      localStorage.setItem('authToken', response.data.token);

      return {
        token: response.data.token,
      };
    } catch (error) {
      this.logout();
      throw handleApiError(error);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
export default authService;