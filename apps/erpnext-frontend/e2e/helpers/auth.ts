import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  
  // 로그인 페이지가 로드될 때까지 대기
  await page.waitForLoadState('networkidle');
  
  // 로그인 폼 입력
  await page.getByPlaceholder('jane@example.com').fill('Administrator');
  await page.getByPlaceholder('•••••').fill('admin');
  
  // 로그인 버튼 클릭
  await page.getByRole('button', { name: '로그인' }).click();
  
  // 로그인 성공 후 대시보드로 이동하거나 에러 확인
  try {
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  } catch (error) {
    // 에러 메시지가 있는지 확인
    const errorMessage = await page.locator('text=/Login failed|로그인 실패|Invalid|실패/i').first().textContent().catch(() => null);
    if (errorMessage) {
      console.error('로그인 에러:', errorMessage);
    }
    throw new Error('로그인에 실패했습니다. ERPNext 서버가 실행 중인지 확인하세요.');
  }
}
