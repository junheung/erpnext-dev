// Item 기본 타입
export interface Item {
  name: string;              // ERPNext의 primary key (document name)
  item_code: string;         // 물품 코드
  item_name: string;         // 물품명
  item_group?: string;       // 물품 그룹
  stock_uom?: string;        // 재고 단위
  standard_rate?: number;    // 표준 단가
  valuation_rate?: number;   // 평가 단가
  opening_stock?: number;    // 초기 재고
  disabled?: 0 | 1;          // 비활성화 여부
  description?: string;      // 설명
  image?: string;            // 이미지 URL
  is_stock_item?: 0 | 1;     // 재고 품목 여부
  brand?: string;            // 브랜드
  creation?: string;         // 생성일시
  modified?: string;         // 수정일시
  owner?: string;            // 소유자
}

// Item 리스트 조회 파라미터
export interface ItemListParams {
  fields?: string[];         // 조회할 필드 배열
  filters?: Record<string, any> | any[];  // 필터 조건
  limit_start?: number;      // 페이징 시작 (0부터 시작)
  limit_page_length?: number; // 페이지당 개수
  order_by?: string;         // 정렬 (예: "modified desc")
}

// API 응답 타입
export interface ItemListResponse {
  data: Item[];
}

export interface ItemResponse {
  data: Item;
}

// Item 생성/수정용 타입
export interface ItemFormData {
  item_code: string;
  item_name: string;
  item_group?: string;
  stock_uom?: string;
  standard_rate?: number;
  description?: string;
  disabled?: 0 | 1;
  is_stock_item?: 0 | 1;
}
