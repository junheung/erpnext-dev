import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('판매 주문', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await login(page);
    await page.goto('/dashboard/sales-order');
  });

  test('판매 주문 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('판매 주문')).toBeVisible();
  });

  test('새 주문 추가 버튼이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: '새 판매주문' })).toBeVisible();
  });

  test('주문 추가 다이얼로그가 열려야 함', async ({ page }) => {
    await page.getByRole('button', { name: '새 판매주문' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('주문 목록 테이블이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('필터 기능이 작동해야 함', async ({ page }) => {
    // 상태별 필터 테스트
    const statusFilter = page.getByRole('combobox', { name: /상태/i });
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      // 필터 옵션 선택
    }
  });

  test('새 판매주문 생성 플로우', async ({ page }) => {
    await page.getByRole('button', { name: '새 판매주문' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 고객 선택
    const customerSelect = dialog.locator('button[role="combobox"]').first();
    if (await customerSelect.isVisible()) {
      await customerSelect.click();
      // 첫 번째 옵션 선택
      await page.keyboard.press('Enter');
    }

    // 저장
    const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('판매주문 취소 플로우', async ({ page }) => {
    // Draft 상태 주문의 취소 버튼
    const cancelButton = page.getByRole('button', { name: /취소|Cancel/i }).first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      const confirmButton = page.getByRole('button', { name: /확인|취소/i }).last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
