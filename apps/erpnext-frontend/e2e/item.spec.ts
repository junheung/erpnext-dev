import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('품목 등록', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/item-registration');
    await page.waitForLoadState('networkidle');
  });

  test('품목 목록 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.locator('h1', { hasText: '물품 등록' })).toBeVisible();
    await expect(page.getByText(/총.*개의 물품/)).toBeVisible();
  });

  test('새 품목 추가 버튼이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: '새 물품 등록' })).toBeVisible();
  });

  test('품목 추가 다이얼로그가 열려야 함', async ({ page }) => {
    await page.getByRole('button', { name: '새 물품 등록' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('재조회 버튼이 작동해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /재조회/i }).click();
    // 로딩 또는 데이터 갱신 확인
  });

  test('품목 테이블이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('새 품목 생성 플로우', async ({ page }) => {
    await page.getByRole('button', { name: '새 물품 등록' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const timestamp = Date.now();
    await dialog.locator('#item_code').fill(`ITEM${timestamp}`);
    await dialog.locator('#item_name').fill(`테스트품목${timestamp}`);
    
    const saveButton = dialog.getByRole('button', { name: /Create|Update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('품목 수정 플로우', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /수정|Edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const nameField = dialog.locator('#item_name');
      if (await nameField.isVisible()) {
        await nameField.clear();
        await nameField.fill(`수정된품목${Date.now()}`);
      }

      const saveButton = dialog.getByRole('button', { name: /Create|Update/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('품목 삭제 플로우', async ({ page }) => {
    const deleteButton = page.getByRole('button', { name: /삭제|Delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      const confirmButton = page.getByRole('button', { name: /확인|삭제|Delete/i }).last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
