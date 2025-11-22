import axiosInstance from '@/lib/axios';
import type { PurchaseOrder } from '@/types/purchase-order';

interface ListParams {
  filters?: Record<string, any>;
  limit_page_length?: number;
  limit_start?: number;
  order_by?: string;
}

export const purchaseOrderAPI = {
  async list(params: ListParams = {}): Promise<PurchaseOrder[]> {
    const response = await axiosInstance.get(`/resource/Purchase Order`, {
      params: {
        fields: JSON.stringify(['name','supplier','supplier_name','company','transaction_date','schedule_date','currency','status','grand_total','docstatus','creation','modified']),
        limit_page_length: params.limit_page_length || 999,
        limit_start: params.limit_start || 0,
        order_by: params.order_by || 'modified desc',
        filters: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    return response.data.data;
  },

  async get(name: string): Promise<PurchaseOrder> {
    const response = await axiosInstance.get(`/resource/Purchase Order/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async getById(id: string): Promise<PurchaseOrder> {
    const response = await axiosInstance.get(`/resource/Purchase Order/${id}`);
    return response.data.data;
  },
  async create(purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await axiosInstance.post(`/resource/Purchase Order`, purchaseOrder);
    return response.data.data;
  },
  async update(id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await axiosInstance.put(`/resource/Purchase Order/${id}`, purchaseOrder);
    return response.data.data;
  },
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/resource/Purchase Order/${id}`);
  },
  async submit(name: string): Promise<PurchaseOrder> {
    const response = await axiosInstance.put(`/resource/Purchase Order/${encodeURIComponent(name)}`, {
      docstatus: 1
    });
    return response.data.data;
  },
  async cancel(name: string): Promise<PurchaseOrder> {
    const response = await axiosInstance.put(`/resource/Purchase Order/${encodeURIComponent(name)}`, {
      docstatus: 2
    });
    return response.data.data;
  },
};
