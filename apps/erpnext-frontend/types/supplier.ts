/**
 * Supplier 관련 타입 정의
 */

export interface Supplier {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  supplier_name: string;
  supplier_group: string;
  supplier_type: 'Company' | 'Individual' | 'Partnership';
  country: string;
  tax_id?: string;
  tax_category?: string;
  email_id?: string;
  mobile_no?: string;
  website?: string;
  language?: string;
  default_currency?: string;
  supplier_details?: string;
  disabled: number;
  is_transporter?: number;
  is_internal_supplier?: number;
}

export interface SupplierFormData {
  supplier_name: string;
  supplier_group: string;
  supplier_type: 'Company' | 'Individual' | 'Partnership';
  country: string;
  tax_id?: string;
  tax_category?: string;
  email_id?: string;
  mobile_no?: string;
  phone_no?: string;
  website?: string;
  language?: string;
  default_currency?: string;
  supplier_details?: string;
  disabled?: number;
}

export interface SupplierListParams {
  fields?: string[];
  filters?: Record<string, any>;
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

export interface SupplierListResponse {
  data: Supplier[];
}

export interface SupplierResponse {
  data: Supplier;
}
