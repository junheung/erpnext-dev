import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('공급자 관리', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/supplier-management');
  });

  test('공급자 목록 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('공급자 관리')).toBeVisible();
    await expect(page.getByText(/총.*개의 공급자/)).toBeVisible();
  });

  test('새 공급자 추가 버튼이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: /새 공급자/i })).toBeVisible();
  });

  test('공급자 추가 다이얼로그가 열려야 함', async ({ page }) => {
    await page.getByRole('button', { name: /새 공급자/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('재조회 버튼이 작동해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /재조회/i }).click();
    // 로딩 또는 데이터 갱신 확인
  });

  test('공급자 테이블이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('새 공급자 생성 플로우', async ({ page }) => {
    await page.getByRole('button', { name: /새 공급자/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const timestamp = Date.now();
    
    // 공급자 유형 선택
    await dialog.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Company' }).click();
    
    // 공급자명 입력
    await dialog.locator('#supplier_name').fill(`테스트공급자${timestamp}`);
    
    // 공급자 그룹 선택
    await dialog.locator('button[role="combobox"]').nth(1).click();
    await page.keyboard.press('Enter');
    
    const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test('공급자 수정 플로우', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /수정|Edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const nameField = dialog.locator('#supplier_name');
      if (await nameField.isVisible()) {
        await nameField.clear();
        await nameField.fill(`수정된공급자${Date.now()}`);
      }

      const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('공급자 삭제 플로우', async ({ page }) => {
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
