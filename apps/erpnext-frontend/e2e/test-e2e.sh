#!/bin/bash
set -e

# Playwright E2E 테스트 자동화 스크립트
# 실행: ./test-e2e.sh

cd "$(dirname "$0")"

# Playwright 설치 (최초 1회만 필요)
npm install
npx playwright install

# 테스트 실행
npx playwright test

# 테스트 결과 요약 출력
npx playwright show-report
