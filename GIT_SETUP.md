# Git 저장소 설정 가이드

이 프로젝트를 GitHub에 올리고 다른 팀원이 클론하여 사용하는 방법입니다.

## 1️⃣ 개발자 (본인) - Git에 프로젝트 업로드

### Step 1: GitHub 저장소 생성

1. GitHub 웹사이트 접속 (https://github.com)
2. 우측 상단 `+` 버튼 → `New repository` 클릭
3. 저장소 정보 입력:
   - **Repository name**: `erpnext-dev` (또는 원하는 이름)
   - **Description**: `DATCO ERP - ERPNext 15 기반 구매/판매 관리 시스템`
   - **Visibility**: Private (추천) 또는 Public
   - **❌ Initialize this repository with a README 체크 해제** (이미 README.md가 있음)
4. `Create repository` 클릭

생성 후 나오는 URL을 복사하세요 (예: `https://github.com/username/erpnext-dev.git`)

### Step 2: 로컬 Git 저장소 초기화

```bash
# 프로젝트 디렉토리로 이동
cd /Users/parkjunheung/erpnext-dev

# Git 저장소 초기화
git init

# 모든 파일 스테이징 (백업 파일 포함)
git add .

# 스테이징된 파일 확인
git status

# 초기 커밋
git commit -m "Initial commit: ERPNext project"
```

### Step 3: GitHub에 푸시

```bash
# GitHub 저장소를 원격 저장소로 추가 (URL을 실제 URL로 변경)
git remote add origin https://github.com/<username>/<repository-name>.git

# 메인 브랜치로 변경
git branch -M main

# GitHub에 푸시 (최초 1회)
git push -u origin main
```

**인증이 필요한 경우:**
- **Personal Access Token** 사용 권장
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- `repo` 권한 체크 후 생성
- 비밀번호 대신 Token 입력

### Step 4: 확인

GitHub 저장소를 새로고침하면 모든 파일이 업로드된 것을 확인할 수 있습니다.

---

## 2️⃣ 새로운 팀원 - 프로젝트 클론 및 실행

### Step 1: Git 저장소 클론

```bash
# 원하는 디렉토리로 이동
cd ~/Projects  # 또는 원하는 경로

# Git 저장소 클론 (URL을 실제 저장소 URL로 변경)
git clone https://github.com/<username>/<repository-name>.git

# 프로젝트 디렉토리로 이동
cd erpnext-dev
```

### Step 2: Docker 컨테이너 시작

```bash
# Docker 컨테이너 빌드 및 시작
docker-compose up -d

# 컨테이너 상태 확인 (모두 "Up" 상태여야 함)
docker-compose ps
```

### Step 3: ERPNext 사이트 생성

```bash
# 컨테이너 접속
docker exec -it erpnext-frappe bash

# bench 디렉토리로 이동
cd /workspace/frappe-bench

# 사이트 생성
bench new-site erpnext.local \
  --db-name datco_db \
  --db-password admin \
  --admin-password admin \
  --no-mariadb-socket

# ERPNext 앱 설치
bench --site erpnext.local install-app erpnext

# 기본 사이트로 설정
bench use erpnext.local
```

### Step 4: CORS 설정

```bash
# site_config.json 편집 (컨테이너 내부)
nano sites/erpnext.local/site_config.json
```

다음 내용 추가:
```json
{
 "db_name": "datco_db",
 "db_password": "admin",
 "developer_mode": 1,
 "allow_cors": "*",
 "ignore_csrf": 1,
 "auto_reload": true
}
```

저장 후 종료 (Ctrl+O, Enter, Ctrl+X)

### Step 5: 데이터베이스 복원 (Git에서 받은 백업 사용)

```bash
# 호스트 머신에서 백업 파일을 컨테이너로 복사
docker cp database-backup/. erpnext-frappe:/workspace/frappe-bench/sites/erpnext.local/private/backups/

# 컨테이너 접속
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench

# 백업 파일 확인
ls -lh sites/erpnext.local/private/backups/

# 최신 백업 파일명 확인 후 복원 (파일명은 실제 파일명으로 변경)
bench --site erpnext.local restore \
  sites/erpnext.local/private/backups/20251122_124237-erpnext_local-database.sql.gz \
  --with-private-files sites/erpnext.local/private/backups/20251122_124237-erpnext_local-files.tar

# 마이그레이션 실행
bench --site erpnext.local migrate

# 종료 (Ctrl+D)
exit
```

### Step 6: 백엔드 서버 시작

```bash
# 컨테이너 접속
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench

# 개발 서버 시작
bench start
```

**성공 메시지 예시:**
```
web.1 started
socketio.1 started
schedule.1 started
worker_short.1 started
worker_long.1 started
worker_default.1 started
```

### Step 7: 프론트엔드 실행 (새 터미널)

```bash
# 프론트엔드 디렉토리로 이동
cd apps/erpnext-frontend

# npm 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```

**성공 메시지:**
```
VITE v7.2.4  ready in 291 ms

➜  Local:   http://localhost:3000/
```

### Step 8: 브라우저에서 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 (ERPNext)**: http://localhost:8100

**로그인 정보:**
- Username: `Administrator`
- Password: `admin`

---

## 3️⃣ 일상적인 Git 작업

### 최신 변경사항 가져오기

```bash
# 원격 저장소에서 최신 변경사항 가져오기
git pull origin main
```

### 변경사항 커밋 및 푸시

```bash
# 변경된 파일 확인
git status

# 프론트엔드 변경사항 추가
git add apps/erpnext-frontend/

# 커밋
git commit -m "feat: 새로운 기능 추가"

# GitHub에 푸시
git push origin main
```

### 백업 생성 및 커밋

```bash
# 자동 백업 스크립트 실행
./backup.sh

# Git 커밋 (스크립트에서 물어봄)
# 또는 수동으로:
git add database-backup/
git commit -m "backup: $(date +%Y%m%d)"
git push origin main
```

---

## 4️⃣ 브랜치 전략 (권장)

### Feature 브랜치 사용

```bash
# 새 기능 개발 시 브랜치 생성
git checkout -b feature/dashboard-enhancement

# 작업 완료 후 커밋
git add .
git commit -m "feat: 대시보드 통계 개선"

# GitHub에 푸시
git push origin feature/dashboard-enhancement

# GitHub에서 Pull Request 생성
# 리뷰 후 main 브랜치에 병합
```

### 브랜치 전략

```
main (프로덕션)
├── develop (개발 중인 기능)
├── feature/customer-management
├── feature/sales-order
└── hotfix/login-bug
```

---

## 5️⃣ 문제 해결

### Git 인증 오류

**문제:** `fatal: Authentication failed`

**해결:**
```bash
# Personal Access Token 사용
# URL 형식: https://<TOKEN>@github.com/<username>/<repo>.git

git remote set-url origin https://<YOUR_TOKEN>@github.com/<username>/<repository>.git
```

### 대용량 파일 경고

**문제:** 백업 파일이 너무 크면 GitHub에서 경고

**해결:**
1. `.gitignore`에서 백업 파일 제외:
   ```gitignore
   database-backup/*.sql.gz
   database-backup/*.tar
   ```

2. Git LFS (Large File Storage) 사용:
   ```bash
   # Git LFS 설치 (macOS)
   brew install git-lfs
   
   # Git LFS 활성화
   git lfs install
   
   # 대용량 파일 추적
   git lfs track "database-backup/*.tar"
   git add .gitattributes
   git commit -m "Add Git LFS for backup files"
   ```

3. 또는 백업 파일을 별도 저장소에 보관:
   - Google Drive
   - AWS S3
   - Dropbox

### 병합 충돌 (Merge Conflict)

**문제:** 다른 팀원과 동시에 같은 파일 수정

**해결:**
```bash
# 최신 변경사항 가져오기
git pull origin main

# 충돌 파일 확인
git status

# 충돌 해결 후
git add <resolved-files>
git commit -m "Resolve merge conflict"
git push origin main
```

---

## 6️⃣ GitHub 저장소 관리

### 팀원 초대

1. GitHub 저장소 페이지 → Settings
2. Collaborators and teams → Add people
3. 팀원의 GitHub username 입력 → Add

### Branch Protection (권장)

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. 체크 옵션:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging

---

## 7️⃣ 체크리스트

### 개발자 (본인)

- [ ] GitHub 저장소 생성
- [ ] `git init` 및 초기 커밋
- [ ] 원격 저장소 추가 (`git remote add origin`)
- [ ] GitHub에 푸시 (`git push -u origin main`)
- [ ] 팀원 초대
- [ ] 백업 파일 포함 여부 결정 (.gitignore 설정)

### 새로운 팀원

- [ ] Git 저장소 클론
- [ ] Docker 컨테이너 시작
- [ ] ERPNext 사이트 생성
- [ ] CORS 설정
- [ ] 데이터베이스 백업 복원
- [ ] 백엔드 서버 시작 확인 (http://localhost:8100)
- [ ] 프론트엔드 npm install 및 실행
- [ ] 브라우저에서 로그인 테스트 (http://localhost:3000)

---

## 📚 추가 자료

- [Git 기본 사용법](https://git-scm.com/book/ko/v2)
- [GitHub 가이드](https://guides.github.com/)
- [Git 브랜치 전략](https://nvie.com/posts/a-successful-git-branching-model/)

---

**마지막 업데이트**: 2025년 11월 22일
