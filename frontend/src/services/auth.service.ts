import api from './api';
import { AuthResponse, LoginCredentials, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Attempting login with credentials:', {
      email: credentials.email,
      passwordLength: credentials.password.length
    });
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async verify(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/verify');
      return response.data.user;
    } catch (error) {
      console.error('Verify error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  activateMieterAccount: async (token: string, password: string) => {
    const response = await api.post('/auth/mieter/activate', { token, password });
    return response.data;
  },

  async requestPasswordReset(email: string) {
    await api.post('/auth/request-password-reset', { email });
  },

  async resetPassword(token: string, newPassword: string) {
    await api.post('/auth/reset-password', { token, password: newPassword });
  },
};
