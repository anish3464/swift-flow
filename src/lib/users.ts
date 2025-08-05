import api from './api';
import { User } from './auth';

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string | null;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'manager' | 'member' | 'viewer';
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string | null;
  is_active?: boolean;
}

export const userService = {
  async getCompanyUsers(): Promise<User[]> {
    const response = await api.get('/auth/users/');
    return response.data.results || response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/auth/users/${id}/`);
    return response.data;
  },

  async createUser(data: UserCreateData): Promise<User> {
    const response = await api.post('/auth/users/', data);
    return response.data;
  },

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    const response = await api.patch(`/auth/users/${id}/`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/auth/users/${id}/`);
  },

  async activateUser(id: string): Promise<User> {
    const response = await api.patch(`/auth/users/${id}/`, { is_active: true });
    return response.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const response = await api.patch(`/auth/users/${id}/`, { is_active: false });
    return response.data;
  },
};