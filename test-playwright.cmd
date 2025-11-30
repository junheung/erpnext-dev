@echo off
REM Playwright E2E 테스트 자동화 스크립트 (Windows용)
REM 실행: test-playwright.cmd

setlocal enabledelayedexpansion

REM Playwright 테스트는 apps/erpnext-frontend 디렉터리에서 실행
cd /d "%~dp0"

REM Playwright 설치 (최초 1회만 필요)
echo Installing dependencies...
call npm install

echo Installing Playwright browsers...
call npx playwright install

REM 테스트 실행
echo Running Playwright tests...
call npx playwright test

REM 테스트 결과 요약 출력
echo Opening test report...
call npx playwright show-report

endlocal

