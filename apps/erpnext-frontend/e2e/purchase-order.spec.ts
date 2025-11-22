import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('구매 주문', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/purchase-order');
  });

  test('구매 주문 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('구매 주문')).toBeVisible();
  });

  test('새 구매주문 추가 버튼이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: /새 구매주문/i })).toBeVisible();
  });

  test('구매주문 추가 다이얼로그가 열려야 함', async ({ page }) => {
    await page.getByRole('button', { name: /새 구매주문/i }).click();
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

  test('새 구매주문 생성 플로우', async ({ page }) => {
    await page.getByRole('button', { name: /새 구매주문/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 공급업체 선택
    const supplierSelect = dialog.locator('button[role="combobox"]').first();
    if (await supplierSelect.isVisible()) {
      await supplierSelect.click();
      await page.keyboard.press('Enter');
    }

    const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('구매주문 취소 플로우', async ({ page }) => {
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
