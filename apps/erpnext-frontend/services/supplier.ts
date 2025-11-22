import axiosInstance from '@/lib/axios';
import type { Supplier } from '@/types/supplier';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const supplierAPI = {
  async list(params: ListParams = {}): Promise<Supplier[]> {
    const response = await axiosInstance.get(`/resource/Supplier`, {
      params: {
        fields: JSON.stringify([
          'name',
          'supplier_name',
          'supplier_group',
          'supplier_type',
          'country',
          'tax_id',
          'mobile_no',
          'email_id',
          'website',
          'disabled',
          'creation',
          'modified',
        ]),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<Supplier> {
    const response = await axiosInstance.get(`/resource/Supplier/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Supplier> {
    const response = await axiosInstance.get(`/resource/Supplier/${id}`);
    return response.data.data;
  },

  async create(supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await axiosInstance.post(`/resource/Supplier`, supplier);
    return response.data.data;
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await axiosInstance.put(`/resource/Supplier/${id}`, supplier);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Supplier/${id}`);
  },

  async getSupplierGroups(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/Supplier Group`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || ['All Supplier Groups'];
    } catch (error) {
      console.error('Failed to fetch supplier groups:', error);
      return ['All Supplier Groups', 'Hardware', 'Services', 'Raw Material'];
    }
  },

  async getCountries(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/Country`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || ['South Korea'];
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return ['South Korea', 'United States', 'China', 'Japan'];
    }
  },
};
