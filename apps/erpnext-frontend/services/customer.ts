import axiosInstance from '@/lib/axios';
import type { Customer } from '@/types/customer';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const customerAPI = {
  async list(params: ListParams = {}): Promise<Customer[]> {
    const response = await axiosInstance.get(`/resource/Customer`, {
      params: {
        fields: JSON.stringify(['name','customer_name','customer_type','customer_group','territory','mobile_no','email_id','tax_id','website','disabled','creation']),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<Customer> {
    const response = await axiosInstance.get(`/resource/Customer/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await axiosInstance.get(`/resource/Customer/${id}`);
    return response.data.data;
  },
  async create(customer: Partial<Customer>): Promise<Customer> {
    const response = await axiosInstance.post(`/resource/Customer`, customer);
    return response.data.data;
  },
  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await axiosInstance.put(`/resource/Customer/${id}`, customer);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Customer/${id}`);
  },

  async getTerritories(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/Territory`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || ['All Territories'];
    } catch (error) {
      console.error('Failed to fetch territories:', error);
      return ['All Territories'];
    }
  },

  async getCustomerGroups(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/Customer Group`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || [];
    } catch (error) {
      console.error('Failed to fetch customer groups:', error);
      return ['Commercial', 'Government', 'Individual', 'Non Profit'];
    }
  },
};
