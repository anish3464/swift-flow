import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  company: string;
  company_name: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  phone?: string;
  avatar?: string;
  position?: string;
  department?: string;
  is_company_owner: boolean;
  is_active: boolean;
}

export interface Company {
  id: string;
  name: string;
  company_type: 'company' | 'freelancer';
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  users_count: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CompanyRegistrationData {
  name: string;
  company_type: 'company' | 'freelancer';
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  owner_username: string;
  owner_email: string;
  owner_password: string;
  owner_password_confirm: string;
  owner_first_name?: string;
  owner_last_name?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  company?: Company;
  tokens: {
    access: string;
    refresh: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login/', credentials);
    const { tokens } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    return response.data;
  },

  async register(data: CompanyRegistrationData): Promise<AuthResponse> {
    const response = await api.post('/auth/register/', data);
    const { tokens } = response.data;
    
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await api.post('/auth/logout/', {
        refresh_token: refreshToken,
      });
    } catch (error) {
      // Even if logout fails on backend, clear local storage
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/current-user/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> {
    const response = await api.patch('/auth/change-password/', data);
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};