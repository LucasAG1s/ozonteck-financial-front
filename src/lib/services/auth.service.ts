import { z } from 'zod';
import api from '../axios';

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
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response: {
        data: Record<string, unknown>;
        status: number;
      };
      message: string;
    };

    return {
      message:
        (axiosError.response.data.message as string) ||
        (axiosError.response.data.error as string) ||
        axiosError.message ||
        'Erro desconhecido',
      status: axiosError.response.status,
      details: axiosError.response.data
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Erro desconhecido',
  };
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
      const response = await api.get<User>('api/user/me');
      return response.data;
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