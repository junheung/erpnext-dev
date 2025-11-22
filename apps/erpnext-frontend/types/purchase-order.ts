/**
 * Purchase Order 타입 정의
 */

// 구매주문 메인 문서
export interface PurchaseOrder {
  name: string;
  supplier: string;
  supplier_name?: string;
  transaction_date: string;
  schedule_date?: string;
  company: string;
  currency: string;
  conversion_rate?: number;
  
  // 품목
  items: PurchaseOrderItem[];
  
  // 세금
  taxes?: PurchaseOrderTax[];
  
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
  per_received: number; // 입고 진행률 (%)
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

// 구매주문 품목
export interface PurchaseOrderItem {
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
  schedule_date?: string;
  received_qty?: number;
  billed_amt?: number;
  idx?: number;
}

// 구매주문 세금
export interface PurchaseOrderTax {
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
export interface PurchaseOrderListParams {
  fields?: string[];
  filters?: Record<string, any>;
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

// API 응답 타입
export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder;
}

// 폼 데이터 타입
export interface PurchaseOrderFormData {
  supplier: string;
  supplier_name?: string;
  transaction_date: string;
  schedule_date?: string;
  company: string;
  currency?: string;
  conversion_rate?: number;
  items: PurchaseOrderItem[];
  taxes?: PurchaseOrderTax[];
  apply_discount_on?: string;
  additional_discount_percentage?: number;
  discount_amount?: number;
  total_qty?: number;
  grand_total?: number;
}
