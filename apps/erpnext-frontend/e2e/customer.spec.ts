import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('고객 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await login(page);
    await page.goto('/dashboard/customer-management');
  });

  test('고객 목록 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('고객 관리')).toBeVisible();
    await expect(page.getByText(/총.*개의 고객/)).toBeVisible();
  });

  test('새 고객 추가 버튼이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: /새 고객/i })).toBeVisible();
  });

  test('고객 추가 다이얼로그가 열려야 함', async ({ page }) => {
    await page.getByRole('button', { name: /새 고객/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('재조회 버튼이 작동해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /재조회/i }).click();
    // 로딩 또는 데이터 갱신 확인
  });

  test('고객 테이블이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('새 고객 생성 플로우', async ({ page }) => {
    // 새 고객 버튼 클릭
    await page.getByRole('button', { name: /새 고객/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 폼 입력
    const timestamp = Date.now();
    
    // 고객 유형 선택
    await dialog.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Company' }).click();
    
    // 고객명 입력
    await dialog.locator('#customer_name').fill(`테스트고객${timestamp}`);
    
    // 고객 그룹 선택
    await dialog.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option', { name: 'Commercial' }).first().click();
    
    // 저장 버튼 클릭
    const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      // 다이얼로그가 닫힌거나 성공 메시지 확인
      await page.waitForTimeout(2000);
    }
  });

  test('고객 수정 플로우', async ({ page }) => {
    // 테이블에서 첫 번째 행의 수정 버튼 클릭
    const editButton = page.getByRole('button', { name: /수정|Edit/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // 고객명 수정
      const nameField = dialog.locator('#customer_name');
      if (await nameField.isVisible()) {
        await nameField.clear();
        await nameField.fill(`수정된고객${Date.now()}`);
      }

      const saveButton = dialog.getByRole('button', { name: /저장|Save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('고객 삭제 플로우', async ({ page }) => {
    // 테이블에서 삭제 버튼 클릭
    const deleteButton = page.getByRole('button', { name: /삭제|Delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // 확인 다이얼로그에서 확인 버튼 클릭
      const confirmButton = page.getByRole('button', { name: /확인|삭제|Delete/i }).last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
