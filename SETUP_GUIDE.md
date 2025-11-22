git clone https://github.com/junheung/erpnext-dev
docker-compose up -d
docker-compose ps
docker exec -it erpnext-frappe bash
# ERPNext + Frontend 개발환경 세팅 가이드

이 문서는 본 프로젝트를 Git에서 다운로드 받아 **로컬/개발 환경**을 동일하게 구성하는 방법을 안내합니다.

---

## 1. 사전 준비
- Docker, Docker Compose 설치
- Git 설치

## 2. 프로젝트 다운로드
```bash
git clone <YOUR_REPO_URL> erpnext-dev
```

```env
DB_ROOT_PASSWORD=admin
DB_NAME=datco_db
DB_USER=erpuser


## 1. 시스템 요구사항 및 사전 준비
- **운영체제**: macOS, Linux, Windows(WSL2 권장)
- **필수 소프트웨어**:
  - Docker (v20 이상)
  - Docker Compose (v2 이상)
  - Git (v2.30 이상)
  - Node.js (v18 이상, 프론트엔드 개발용)
  - npm (v9 이상)

설치 예시 (macOS/Homebrew):
```bash
brew install --cask docker
brew install git
brew install node
```

## 2. 프로젝트 구조

프로젝트 폴더 구조 및 주요 경로 안내:
```
bench use $SITE_NAME
```

## 8. 개발 서버(HMR) 실행
프론트엔드 소스 수정 시 자동 반영:
```
## 9. 기타 참고
- `setup.sh`, `start.sh`는 ERPNext 개발 환경 초기화/실행용입니다. 필요시 직접 실행하세요.
- 문제 발생 시 `logs/` 폴더의 로그 파일을 참고하세요.

---

## 10. 자주 묻는 질문
- **포트 충돌**: 8300/8100 포트가 이미 사용 중이면 다른 포트로 변경하거나 기존 프로세스를 종료하세요.
- **프론트엔드 HMR 미작동**: docker-compose.yml의 volumes, command 설정을 확인하세요.

---

**문의/이슈**: Github Issue 또는 담당자에게 문의 바랍니다.
nano sites/erpnext.local/site_config.json
```

다음 내용으로 수정:

```json
{
 "db_name": "datco_db",
 "db_password": "admin",
 "developer_mode": 1,
 "allow_cors": "*",
 "auto_reload": true
}
```

## 3. 환경 변수 설정 (.env)

프로젝트 루트에 `.env` 파일을 생성하여 아래와 같이 환경 변수를 설정합니다:
```env
DB_ROOT_PASSWORD=admin
DB_NAME=datco_db
DB_USER=erpuser
DB_PASSWORD=admin
SITE_NAME=erpnext.local
ADMIN_PASSWORD=admin
DB_HOST=mariadb
DB_PORT=3306
```
프론트엔드용 환경 변수 예시 (`apps/erpnext-frontend/.env`):
```env
VITE_API_URL=http://localhost:8100
```
```

저장 후 종료 (Ctrl+O, Enter, Ctrl+X)

---

## 프론트엔드 실행

### Step 1: 의존성 설치

```bash
# 프론트엔드 디렉토리로 이동
cd apps/erpnext-frontend

# npm 패키지 설치
npm install
```

### Step 2: 환경 변수 확인

`.env` 파일이 있는지 확인 (없으면 생성):

```env
VITE_API_URL=http://localhost:8100
```

### Step 3: 개발 서버 시작

```bash
npm run dev
```

성공하면 다음과 같이 출력됩니다:

```
VITE v7.2.4  ready in 291 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

브라우저에서 `http://localhost:3000` 접속

---

## 백엔드 실행

### ERPNext 서버 시작

```bash
# 컨테이너 접속
docker exec -it erpnext-frappe bash

# bench 디렉토리로 이동
cd /workspace/frappe-bench

# 개발 서버 시작
bench start
```

성공하면:
```
Watching for changes...
web.1 started
socketio.1 started
watch.1 started
schedule.1 started
worker_short.1 started
worker_long.1 started
worker_default.1 started
```

ERPNext는 `http://localhost:8100`에서 실행됩니다.

### 기본 로그인 정보

**ERPNext 웹 인터페이스** (http://localhost:8100)
- Username: `Administrator`
- Password: `admin`

**프론트엔드 애플리케이션** (http://localhost:3000)
- Username: `Administrator`
- Password: `admin`

---

## 프로젝트 구조

```
erpnext-dev/
├── README.md                    # 기본 README
├── SETUP_GUIDE.md              # 이 파일
├── docker-compose.yml          # Docker 설정
├── Dockerfile                  # Docker 이미지
├── apps/
│   ├── erpnext/               # ERPNext 백엔드
│   ├── frappe/                # Frappe Framework
│   └── erpnext-frontend/      # React 프론트엔드 ⭐
│       ├── src/
│       │   ├── components/    # 재사용 가능한 UI 컴포넌트
│       │   │   ├── ui/       # shadcn/ui 기반 컴포넌트
│       │   │   ├── layout/   # 레이아웃 컴포넌트
│       │   │   ├── customer/ # 고객 관련 컴포넌트
│       │   │   ├── supplier/ # 공급자 관련 컴포넌트
│       │   │   ├── item/     # 물품 관련 컴포넌트
│       │   │   ├── sales-order/    # 판매주문 컴포넌트
│       │   │   └── purchase-order/ # 구매주문 컴포넌트
│       │   ├── pages/         # 페이지 컴포넌트
│       │   │   ├── Main.tsx           # 대시보드
│       │   │   ├── Login.tsx          # 로그인
│       │   │   ├── CustomerManagement.tsx
│       │   │   ├── SupplierManagement.tsx
│       │   │   ├── ItemRegistration.tsx
│       │   │   ├── PurchaseOrder.tsx
│       │   │   └── SalesOrder.tsx
│       │   ├── services/      # API 서비스
│       │   │   ├── api.ts    # Axios 인스턴스
│       │   │   ├── auth.ts
│       │   │   ├── customer.ts
│       │   │   ├── supplier.ts
│       │   │   ├── item.ts
│       │   │   ├── company.ts
│       │   │   ├── sales-order.ts
│       │   │   └── purchase-order.ts
│       │   ├── types/         # TypeScript 타입
│       │   ├── contexts/      # React Context
│       │   └── lib/           # 유틸리티
│       ├── package.json
│       └── vite.config.ts
├── sites/
│   └── erpnext.local/         # ERPNext 사이트
└── config/                    # 설정 파일
```

---

## 주요 기능

### 1. 대시보드 (/)
- 총 물품 수 통계
- 금일 입고주문/출고주문 카운트
- 최근 활동 타임라인 (실시간)

### 2. 공급자 관리 (/supplier-management)
- 공급자 생성/조회/수정/삭제 (CRUD)
- 공급자 유형별 필터링
- 상태별 필터링 (활성/비활성)
- 검색 기능

### 3. 고객 관리 (/customer-management)
- 고객 CRUD
- 유형별 필터링 (Company/Individual)
- 고객 그룹별 필터링
- 상태별 필터링

### 4. 물품 등록 (/item-registration)
- 물품 CRUD
- 물품 그룹 관리
- 단위(UOM) 관리
- 필수 필드 검증

### 5. 구매 주문 (/purchase-order)
- 구매주문 생성/수정
- 주문 제출/취소
- 품목 테이블 관리
- 상태별 Badge 표시
  - Draft (초안) - 회색
  - To Receive and Bill - 주황색
  - To Receive - 파란색
  - To Bill - 노란색
  - Completed - 초록색
  - Cancelled - 빨간색

### 6. 판매 주문 (/sales-delivery)
- 판매주문 생성/수정
- 주문 제출/취소
- 품목 테이블 관리
- 상태별 Badge 표시

### UI/UX 특징
- 커스텀 AlertDialog/ConfirmDialog (브랜드 색상 적용)
- 검색 가능한 Combobox (고객/공급자/품목 선택)
- 반응형 디자인
- 다크 테마 사이드바
- 드롭다운 액션 메뉴

---

## 개발 워크플로우

### 프론트엔드 개발

```bash
cd apps/erpnext-frontend

# 개발 서버 시작 (HMR 지원)
npm run dev

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 백엔드 개발

```bash
# 컨테이너 접속
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench

# 개발 서버 시작
bench start

# 새 DocType 생성
bench --site erpnext.local new-doctype

# 마이그레이션
bench --site erpnext.local migrate

# 콘솔 접속
bench --site erpnext.local console
```

### Git 워크플로우

```bash
# 프론트엔드 변경사항
git add apps/erpnext-frontend/
git commit -m "feat: 대시보드 통계 추가"

# 백엔드 변경사항
git add apps/erpnext/ apps/frappe/
git commit -m "fix: API 응답 형식 수정"


git push origin main
```

---

## 문제 해결

### 1. Docker 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs

# 컨테이너 재시작
docker-compose restart

# 완전히 초기화 (주의: 데이터 삭제됨)
docker-compose down -v
docker-compose up -d
```

### 2. 데이터베이스 연결 오류

```bash
# MariaDB 상태 확인
docker exec -it erpnext-frappe bash
service mariadb status

# MariaDB 재시작
service mariadb restart

# MariaDB 접속 테스트
mysql -u root -padmin
```

### 3. 프론트엔드 CORS 오류

**증상**: API 호출 시 CORS 에러

**해결**:
1. `sites/erpnext.local/site_config.json` 확인:
   ```json
   {
     "allow_cors": "*",
     "ignore_csrf": 1
   }
   ```

2. ERPNext 서버 재시작:
   ```bash
   docker exec -it erpnext-frappe bash
   cd /workspace/frappe-bench
   bench restart
   ```

3. 브라우저 캐시 삭제 (Cmd+Shift+R / Ctrl+Shift+R)

### 4. 프론트엔드 빌드 오류

```bash
cd apps/erpnext-frontend

# node_modules 완전 삭제 및 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# TypeScript 캐시 삭제
rm -rf node_modules/.vite
```

### 5. 포트 충돌

**macOS/Linux:**
```bash
# 포트 사용 확인
lsof -i :8100  # ERPNext
lsof -i :3000  # React

# 프로세스 종료
kill -9 <PID>
```

**Windows (PowerShell):**
```powershell
# 포트 사용 확인
netstat -ano | findstr :8100

# 프로세스 종료
taskkill /PID <PID> /F
```

### 6. 백업 복원 실패

```bash
# 1. 기존 사이트 삭제
bench drop-site erpnext.local --force

# 2. 새 사이트 생성
bench new-site erpnext.local --db-name datco_db --db-password admin --admin-password admin --no-mariadb-socket
bench --site erpnext.local install-app erpnext

# 3. 백업 다시 복원
bench --site erpnext.local restore <backup-file>.sql.gz --with-private-files <backup-file>.tar

# 4. 마이그레이션
bench --site erpnext.local migrate
```

### 7. 프론트엔드 로그인 실패

**증상**: 로그인 버튼 클릭 시 반응 없음

**해결**:
1. 브라우저 개발자 도구 (F12) → Console 탭 확인
2. Network 탭에서 API 요청 상태 확인
3. ERPNext 서버 실행 여부 확인:
   ```bash
   curl http://localhost:8100/api/method/ping
   # 응답: {"message":"pong"}
   ```

---

## 성능 최적화

### Docker 리소스 할당

Docker Desktop → Settings → Resources

권장 설정:
- **CPU**: 4 cores
- **Memory**: 8GB
- **Swap**: 2GB
- **Disk**: 60GB

### 프론트엔드 최적화

```bash
# 프로덕션 빌드 최적화
npm run build -- --mode production

# 빌드 분석
npm run build -- --mode analyze
```

---

## Git 워크플로우

### Git 저장소 초기화 (최초 1회만)

```bash
# 프로젝트 루트에서 실행
cd /Users/parkjunheung/erpnext-dev

# Git 저장소 초기화
git init

# 모든 파일 추가 (백업 파일 포함)
git add .

# 초기 커밋
git commit -m "Initial commit: ERPNext project with database backup"

# GitHub 원격 저장소 추가 (저장소 URL을 실제 URL로 변경)
git remote add origin <your-github-repository-url>

# 원격 저장소로 푸시
git branch -M main
git push -u origin main
```

### 일반적인 Git 작업

```bash
# 프론트엔드 변경사항
git add apps/erpnext-frontend/
git commit -m "feat: 대시보드 통계 추가"

# 백엔드 변경사항
git add apps/erpnext/ apps/frappe/
git commit -m "fix: API 응답 형식 수정"

git push origin main
```

### .gitignore 설정

현재 `.gitignore` 설정:
- ✅ 백업 파일 (.sql.gz, .tar)은 **Git에 포함**됩니다
- 제외하려면 `.gitignore`의 주석을 해제하세요:

```gitignore
```

---

## 보안 설정 (프로덕션)

### 1. 비밀번호 변경

```bash
# ERPNext 관리자 비밀번호 변경
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench
bench --site erpnext.local set-admin-password <new-password>
```

### 2. CORS 제한

`sites/erpnext.local/site_config.json`:

```json
{
  "allow_cors": "http://yourdomain.com",
  "ignore_csrf": 0
}
```

### 3. HTTPS 설정

Nginx 리버스 프록시 사용 권장 (별도 설정 필요)

---

## 배포 가이드

### 프론트엔드 배포

```bash
cd apps/erpnext-frontend

# 프로덕션 빌드
npm run build

# dist/ 폴더를 정적 파일 서버에 배포
# - Nginx
# - Apache
# - Vercel
# - Netlify
```

### 백엔드 배포

```bash
# 프로덕션 모드 설정
nano sites/erpnext.local/site_config.json

# developer_mode 비활성화
{
  "developer_mode": 0,
  "allow_cors": "http://yourdomain.com"
}

# Supervisor로 프로덕션 서버 실행
bench setup supervisor
sudo supervisorctl reload
```

---

## FAQ

### Q: 처음 실행 시 사이트가 없다고 나옵니다.
**A**: Step 3의 사이트 초기화를 실행하지 않았습니다. `bench new-site datco.local` 명령을 실행하세요.

### Q: 프론트엔드에서 API 호출이 실패합니다.
**A**: 
1. ERPNext 서버가 실행 중인지 확인 (`http://localhost:8100`)
2. CORS 설정 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### Q: 백업 파일이 너무 큽니다.
**A**: 
- `.sql.gz` 파일만 Git에 포함 (압축됨)
- `.tar` 파일은 용량이 크므로 별도 저장소 사용 권장 (Google Drive, S3 등)

### Q: Docker 컨테이너가 느립니다.
**A**: Docker Desktop의 리소스 할당을 늘리세요 (CPU 4코어, RAM 8GB 권장)

---

## 유용한 명령어 모음

### Docker

```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 실시간 확인
docker-compose logs -f

# 컨테이너 재시작
docker-compose restart

# 컨테이너 완전 재시작
docker-compose down && docker-compose up -d

# 디스크 사용량 확인
docker system df
```

### Bench

```bash
# 사이트 목록
bench --site erpnext.local list-apps

# 사이트 정보
bench --site erpnext.local show-config

# 캐시 클리어
bench --site erpnext.local clear-cache

# 데이터베이스 콘솔
bench --site erpnext.local mariadb

# Python 콘솔
bench --site erpnext.local console
```

### Git

```bash
# 현재 상태 확인
git status

# 변경사항 확인
git diff

# 최근 커밋 로그
git log --oneline -10

# 특정 파일 변경 이력
git log --follow <file>
```

---

## 참고 자료

- [Frappe Framework 문서](https://frappeframework.com/docs)
- [ERPNext 문서](https://docs.erpnext.com/)
- [React 문서](https://react.dev/)
- [Vite 문서](https://vitejs.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

## 라이선스

이 프로젝트는 내부용입니다. 외부 배포 및 재배포를 금지합니다.

---

## 지원

문제가 발생하거나 질문이 있으시면:
1. 이 문서의 [문제 해결](#문제-해결) 섹션 확인
2. GitHub Issues 생성
3. 개발팀에 문의

---

**마지막 업데이트**: 2025년 11월 22일
