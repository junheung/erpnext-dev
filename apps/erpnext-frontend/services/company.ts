import axiosInstance from '@/lib/axios';
import type { Company } from '@/types/company';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const companyAPI = {
  async list(params: ListParams = {}): Promise<Company[]> {
    const response = await axiosInstance.get(`/resource/Company`, {
      params: {
        fields: JSON.stringify(['name','company_name','abbr','default_currency','country','domain']),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<Company> {
    const response = await axiosInstance.get(`/resource/Company/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Company> {
    const response = await axiosInstance.get(`/resource/Company/${id}`);
    return response.data.data;
  },
  async create(company: Partial<Company>): Promise<Company> {
    const response = await axiosInstance.post(`/resource/Company`, company);
    return response.data.data;
  },
  async update(id: string, company: Partial<Company>): Promise<Company> {
    const response = await axiosInstance.put(`/resource/Company/${id}`, company);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Company/${id}`);
  },
};
