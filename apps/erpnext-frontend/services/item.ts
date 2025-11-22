import axiosInstance from '@/lib/axios';
import type { Item } from '@/types/item';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const itemAPI = {
  async list(params: ListParams = {}): Promise<Item[]> {
    const response = await axiosInstance.get(`/resource/Item`, {
      params: {
        fields: JSON.stringify(['name','item_code','item_name','item_group','stock_uom','is_stock_item','valuation_rate','standard_rate','opening_stock','disabled','description','brand','creation']),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<Item> {
    const response = await axiosInstance.get(`/resource/Item/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<Item> {
    const response = await axiosInstance.get(`/resource/Item/${id}`);
    return response.data.data;
  },
  async create(item: Partial<Item>): Promise<Item> {
    const response = await axiosInstance.post(`/resource/Item`, item);
    return response.data.data;
  },
  async update(id: string, item: Partial<Item>): Promise<Item> {
    const response = await axiosInstance.put(`/resource/Item/${id}`, item);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Item/${id}`);
  },

  async getItemGroups(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/Item Group`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || [];
    } catch (error) {
      console.error('Failed to fetch item groups:', error);
      return ['All Item Groups', 'Products', 'Raw Material', 'Services'];
    }
  },

  async getUOMs(): Promise<string[]> {
    try {
      const response = await axiosInstance.get(`/resource/UOM`, {
        params: {
          fields: JSON.stringify(['name']),
          limit_page_length: 999,
        },
      });
      return response.data.data?.map((item: any) => item.name) || [];
    } catch (error) {
      console.error('Failed to fetch UOMs:', error);
      return ['Nos', 'Kg', 'Meter', 'Litre', 'Box'];
    }
  },
};
