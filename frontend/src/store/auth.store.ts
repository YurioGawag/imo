import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { UserRole } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  getCurrentRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: false,
      setUser: (user) => {
        if (user && user._id) {
          user.id = user._id;
        }
        set({ user, isAuthenticated: !!user });
      },
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('auth-storage');
        }
        set({ token });
      },
      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login with email:', email);
          const response = await authService.login({ email, password });
          console.log('Login response received:', response);
          
          const { token, user } = response;
          localStorage.setItem('token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      },
      hasRole: (role: UserRole) => {
        const state = get();
        return state.user?.role === role;
      },
      getCurrentRole: () => {
        const state = get();
        return state.user?.role || null;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
