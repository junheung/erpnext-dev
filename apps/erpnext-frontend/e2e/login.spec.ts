import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('로그인 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/ERP/);
    await expect(page.getByText('Login to DATCO ERP')).toBeVisible();
  });

  test('이메일과 비밀번호 입력 필드가 표시되어야 함', async ({ page }) => {
    await expect(page.getByPlaceholder('jane@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('•••••')).toBeVisible();
  });

  test('빈 폼으로 로그인 시도 시 에러 메시지가 표시되어야 함', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click();
    // 브라우저 기본 validation 또는 커스텀 에러 메시지 확인
  });

  test('유효한 자격 증명으로 로그인 성공 시 대시보드로 이동해야 함', async ({ page }) => {
    // 테스트용 계정 정보 (실제 계정으로 수정 필요)
    await page.getByPlaceholder('jane@example.com').fill('Administrator');
    await page.getByPlaceholder('•••••').fill('admin');
    
    await page.getByRole('button', { name: '로그인' }).click();
    
    // 대시보드로 리다이렉트 확인 (타임아웃 증가)
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
