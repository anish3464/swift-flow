import api from './api';
import { Company } from './auth';

export interface CompanyUpdateData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export const companyService = {
  async getCompany(): Promise<Company> {
    const response = await api.get('/auth/company/');
    return response.data;
  },

  async updateCompany(data: CompanyUpdateData): Promise<Company> {
    const response = await api.patch('/auth/company/', data);
    return response.data;
  },
};