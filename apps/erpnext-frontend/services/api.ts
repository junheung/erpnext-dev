// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API 응답 타입
export interface LoginResponse {
  message: string;
  home_page?: string;
  full_name?: string;
}

export interface UserResponse {
  message: string;
}

// CSRF 토큰 가져오기 (여러 방법 시도)
export function getCSRFToken(): string {
  // 방법 1: csrf_token 쿠키에서 읽기
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  
  // 방법 2: frappe.csrf_token 전역 변수 (Frappe가 설정할 수 있음)
  if (typeof window !== 'undefined' && (window as any).frappe?.csrf_token) {
    return (window as any).frappe.csrf_token;
  }
  
  // 방법 3: window._csrf_token
  if (typeof window !== 'undefined' && (window as any)._csrf_token) {
    return (window as any)._csrf_token;
  }
  
  console.warn('CSRF token not found');
  return '';
}

// 로그인 API
export async function login(username: string, password: string): Promise<LoginResponse> {
  // Frappe의 실제 로그인 방식: POST to /api/method/login with cmd=login
  const formData = new URLSearchParams();
  formData.append('cmd', 'login');
  formData.append('usr', username);
  formData.append('pwd', password);

  const response = await fetch(`${API_BASE_URL}/api/method/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Incorrect username or password',
      exc: 'Login failed'
    }));
    throw new Error(error.message || error.exc || 'Login failed');
  }

  const data = await response.json();
  
  // Frappe는 로그인 실패 시에도 200을 반환하고 exc 필드로 에러 표시
  if (data.exc) {
    throw new Error('Incorrect username or password');
  }

  return data;
}

// 로그아웃 API
export async function logout(): Promise<void> {
  const csrfToken = getCSRFToken();
  
  await fetch(`${API_BASE_URL}/api/method/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': csrfToken,
    },
    credentials: 'include',
  });
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/method/frappe.auth.get_logged_user`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.message !== 'Guest' ? data.message : null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
