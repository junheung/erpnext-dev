// Company 기본 타입
export interface Company {
  name: string;              // ERPNext의 primary key (document name)
  company_name: string;      // 회사명
  abbr?: string;             // 약어
  country?: string;          // 국가
  default_currency?: string; // 기본 통화
  creation?: string;         // 생성일시
  modified?: string;         // 수정일시
  owner?: string;            // 소유자
}

// Company 리스트 조회 파라미터
export interface CompanyListParams {
  fields?: string[];         // 조회할 필드 배열
  filters?: Record<string, any>;
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
}

// API 응답 타입
export interface CompanyListResponse {
  data: Company[];
}

export interface CompanyResponse {
  data: Company;
}
