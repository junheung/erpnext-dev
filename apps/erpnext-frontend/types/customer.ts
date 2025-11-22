// Customer 메인 인터페이스
export interface Customer {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by?: string;
  docstatus: number;
  
  // 기본 정보
  customer_name: string;
  customer_type: 'Company' | 'Individual';
  customer_group: string;
  territory: string;
  
  // 연락처 정보
  email_id?: string;
  mobile_no?: string;
  phone_no?: string;
  website?: string;
  
  // 세금 정보
  tax_id?: string;
  tax_category?: string;
  default_currency?: string;
  default_price_list?: string;
  
  // 상태
  disabled: number; // 0: enabled, 1: disabled
  is_frozen?: number;
  
  // 기타
  image?: string;
  language?: string;
  customer_details?: string;
  
  // 주소 및 연락처 (링크 필드)
  customer_primary_address?: string;
  primary_address?: string;
  customer_primary_contact?: string;
}

// 리스트 조회 파라미터
export interface CustomerListParams {
  fields?: string[];
  filters?: Record<string, any>;
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

// API 응답 타입
export interface CustomerResponse {
  data: Customer[];
}

// 폼 데이터 (생성/수정용)
export interface CustomerFormData {
  customer_name: string;
  customer_type: 'Company' | 'Individual';
  customer_group: string;
  territory: string;
  email_id?: string;
  mobile_no?: string;
  phone_no?: string;
  website?: string;
  tax_id?: string;
  tax_category?: string;
  default_currency?: string;
  language?: string;
  customer_details?: string;
  disabled?: number;
}
