import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  
  // 로그인 페이지가 로드될 때까지 대기 (더 구체적인 선택자 사용)
  // networkidle 대신 로그인 폼이 나타날 때까지 대기
  await page.waitForSelector('input[placeholder*="example.com"], input[type="email"], input[type="text"]', { 
    timeout: 10000 
  }).catch(() => {
    throw new Error('로그인 페이지가 로드되지 않았습니다. 프론트엔드 서버가 실행 중인지 확인하세요.');
  });
  
  // 페이지가 완전히 로드될 때까지 짧은 대기
  await page.waitForLoadState('domcontentloaded');
  
  // 로그인 폼 입력
  const emailInput = page.locator('input[type="email"], input[type="text"]').first();
  // waitForSelector와 동일한 선택자 사용
  await emailInput.fill('Administrator');
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('admin');
  
  // 로그인 버튼 클릭
  await page.getByRole('button', { name: '로그인' }).click();
  
  // 로그인 성공 후 대시보드로 이동하거나 에러 확인
  try {
    await page.waitForURL(/.*dashboard/, { timeout: 20000 });
  } catch (error) {
    // 에러 메시지가 있는지 확인
    const errorMessage = await page.locator('text=/Login failed|로그인 실패|Invalid|실패/i').first().textContent().catch(() => null);
    if (errorMessage) {
      console.error('로그인 에러:', errorMessage);
    }
    // 현재 URL 확인
    const currentUrl = page.url();
    console.error('현재 URL:', currentUrl);
    throw new Error(`로그인에 실패했습니다. ERPNext 백엔드 서버(http://localhost:8100)가 실행 중인지 확인하세요. 현재 URL: ${currentUrl}`);
  }
}
