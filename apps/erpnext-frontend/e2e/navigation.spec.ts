import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('네비게이션 및 라우팅', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('사이드바가 표시되어야 함', async ({ page }) => {
    await page.goto('/dashboard');
    // 사이드바 확인
    await expect(page.locator('nav')).toBeVisible();
  });

  test('고객 관리 메뉴 클릭 시 고객 관리 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: '고객관리' }).click();
    await expect(page).toHaveURL(/.*customer-management/);
  });

  test('품목 등록 메뉴 클릭 시 품목 등록 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: '물품등록' }).click();
    await expect(page).toHaveURL(/.*item-registration/);
  });

  test('공급업체 관리 메뉴 클릭 시 공급업체 관리 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: '공급자관리' }).click();
    await expect(page).toHaveURL(/.*supplier-management/);
  });

  test('판매 주문 메뉴 클릭 시 판매 주문 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: '판매주문' }).click();
    await expect(page).toHaveURL(/.*sales-order/);
  });

  test('구매 주문 메뉴 클릭 시 구매 주문 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: '구매주문' }).click();
    await expect(page).toHaveURL(/.*purchase-order/);
  });
});
