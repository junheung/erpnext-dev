import axios from 'axios';

// Axios 인스턴스 생성 with credentials
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF 토큰 가져오기
function getCSRFToken(): string {
  // ERPNext에서 사용하는 방식들을 시도
  const cookies = document.cookie.split(';');
  
  // 1. csrf_token 쿠키 확인
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  
  // 2. window.csrf_token 확인 (ERPNext에서 자주 사용)
  if (typeof window !== 'undefined' && (window as any).csrf_token) {
    return (window as any).csrf_token;
  }
  
  // 3. 메타 태그에서 확인
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content') || '';
  }
  
  return '';
}

// Request interceptor - CSRF 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      // ERPNext는 모든 요청에 CSRF 토큰이 필요할 수 있음
      config.headers['X-Frappe-CSRF-Token'] = csrfToken;
      // 또는 다른 헤더명 시도
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // ERPNext API 호출을 위한 추가 헤더
    config.headers['Accept'] = 'application/json';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 인증 에러 - 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
