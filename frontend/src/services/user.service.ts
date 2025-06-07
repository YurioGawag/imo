import api from './api';
import { User, UserRole } from '../types/auth';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  unitId?: string;
}

export interface CreateUserResponse {
  user: User;
  temporaryPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Get all users with optional role filter
  async getUsers(role?: UserRole): Promise<User[]> {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Create a new user (admin only)
  async createUser(userData: CreateUserData): Promise<CreateUserResponse> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update a tenant's assigned unit
  async updateUserUnit(userId: string, unitId: string | null): Promise<{ user: User }> {
    const response = await api.put(`/users/${userId}/unit`, { unitId });
    return response.data;
  },

  // Change password (for all users)
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post('/users/change-password', data);
    return response.data;
  }
};
