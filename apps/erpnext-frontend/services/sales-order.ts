import axiosInstance from '@/lib/axios';
import type { SalesOrder } from '@/types/sales-order';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const salesOrderAPI = {
  async list(params: ListParams = {}): Promise<SalesOrder[]> {
    const response = await axiosInstance.get(`/resource/Sales Order`, {
      params: {
        fields: JSON.stringify(['name','customer','customer_name','company','transaction_date','delivery_date','currency','status','grand_total','docstatus','creation','modified']),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<SalesOrder> {
    const response = await axiosInstance.get(`/resource/Sales Order/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<SalesOrder> {
    const response = await axiosInstance.get(`/resource/Sales Order/${id}`);
    return response.data.data;
  },
  async create(salesOrder: Partial<SalesOrder>): Promise<SalesOrder> {
    const response = await axiosInstance.post(`/resource/Sales Order`, salesOrder);
    return response.data.data;
  },
  async update(id: string, salesOrder: Partial<SalesOrder>): Promise<SalesOrder> {
    const response = await axiosInstance.put(`/resource/Sales Order/${id}`, salesOrder);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Sales Order/${id}`);
  },
  async submit(name: string): Promise<SalesOrder> {
    const response = await axiosInstance.put(`/resource/Sales Order/${encodeURIComponent(name)}`, {
      docstatus: 1
    });
    return response.data.data;
  },
  async cancel(name: string): Promise<SalesOrder> {
    const response = await axiosInstance.put(`/resource/Sales Order/${encodeURIComponent(name)}`, {
      docstatus: 2
    });
    return response.data.data;
  },
};
