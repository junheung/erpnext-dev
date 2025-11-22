/**
 * Sales Order 타입 정의
 */

// 판매주문 메인 문서
export interface SalesOrder {
  name: string;
  customer: string;
  customer_name?: string;
  transaction_date: string;
  delivery_date?: string;
  company: string;
  currency: string;
  conversion_rate?: number;
  
  // 품목
  items: SalesOrderItem[];
  
  // 세금
  taxes?: SalesOrderTax[];
  
  // 합계
  total_qty: number;
  base_total?: number;
  total: number;
  net_total?: number;
  grand_total: number;
  base_grand_total: number;
  
  // 진행 상태
  docstatus: number; // 0: Draft, 1: Submitted, 2: Cancelled
  status: string;
  per_delivered: number; // 출고 진행률 (%)
  per_billed: number; // 청구 진행률 (%)
  
  // 기타
  apply_discount_on?: string;
  additional_discount_percentage?: number;
  discount_amount?: number;
  
  // 시스템 필드
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
}

// 판매주문 품목
export interface SalesOrderItem {
  name?: string;
  item_code: string;
  item_name: string;
  description?: string;
  qty: number;
  uom: string;
  stock_uom?: string;
  conversion_factor?: number;
  rate: number;
  amount: number;
  warehouse?: string;
  delivery_date?: string;
  delivered_qty?: number;
  billed_amt?: number;
  idx?: number;
}

// 판매주문 세금
export interface SalesOrderTax {
  name?: string;
  charge_type: string;
  account_head: string;
  description?: string;
  rate?: number;
  tax_amount: number;
  total: number;
  idx?: number;
}

// 리스트 조회 파라미터
export interface SalesOrderListParams {
  fields?: string[];
  filters?: Record<string, any>;
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

// API 응답 타입
export interface SalesOrderListResponse {
  data: SalesOrder[];
}

export interface SalesOrderResponse {
  data: SalesOrder;
}

// 폼 데이터 타입
export interface SalesOrderFormData {
  customer: string;
  customer_name?: string;
  transaction_date: string;
  delivery_date?: string;
  company: string;
  currency: string;
  conversion_rate?: number;
  items: SalesOrderItem[];
  taxes?: SalesOrderTax[];
  apply_discount_on?: string;
  additional_discount_percentage?: number;
  discount_amount?: number;
}
