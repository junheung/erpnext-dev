# ERPNext 15 기반 구매/판매 관리 시스템

ERPNext 15를 기반으로 한 통합 ERP 시스템입니다. Docker 환경에서 실행되며, Next.js 기반의 커스텀 프론트엔드를 제공합니다.

# ERPNext 추천 이유

1. 기본 기능의 풀스택 통합 제공
ERPNext는 회계, 구매/판매, 재고, CRM, 인사/급여, 프로젝트 관리 등 핵심 ERP 기능을 기본 모듈로 제공하여  별도의 추가 모듈 없이 바로 구축을 시작할 수 있습니다.

2. 투명하고 단순한 오픈소스 라이선스 구조
GNU GPL v3 기반으로 제공되며 기능 제한이나 사용자 수별 유료 락이 없어 사용자 증가 시에도 비용 구조 예측이 용이합니다.

3. 뛰어난 커스터마이즈 및 개발 친화성
Python + JavaScript 기반의 Frappe Framework 위에서 동작하며 메타데이터 기반 구조(DocType 등)로 확장성과 커스터마이징이 용이합니다.

4. 폭넓은 산업 적용 가능성
제조, 유통, 서비스뿐 아니라 교육, 병원, 비영리 등 다양한 산업 모듈을 포함하고 있어 여러 사업 분야에 유연하게 적용할 수 있습니다.

## 📋 기술 스택

**백엔드**
- Frappe Framework 15
- ERPNext 15
- MariaDB 10.6
- Python 3.11
- Docker

**프론트엔드**
- Next.js 16
- React 19 + TypeScript
- Tailwind CSS
- shadcn/ui (Tailwind 기반 UI 컴포넌트)
- Radix UI

## 🚀 빠른 시작

### 전체 설치 및 설정 가이드

**자세한 설정 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 파일을 참조하세요.**

이 가이드에는 다음 내용이 포함되어 있습니다:
- ✅ 개발 워크플로우

### 초기 설정 (요약)

```bash
# 1. Docker 컨테이너 시작
docker-compose up -d

# 2. 컨테이너 접속 및 사이트 생성 (최초 1회만)
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench
bench new-site erpnext.local --db-name datco_db --db-password admin --admin-password admin --no-mariadb-socket
bench --site erpnext.local install-app erpnext
bench use erpnext.local

# 3. CORS 설정 (sites/erpnext.local/site_config.json에 추가)
# allow_cors: "*"
# ignore_csrf: 1

# 4. 백엔드 서버 시작
bench start

# 5. 프론트엔드 실행 (새 터미널)
cd apps/erpnext-frontend
npm install
npm run dev
```

### 접속 정보

- **백엔드 (ERPNext)**: http://localhost:8100
- **프론트엔드**: http://localhost:83000
- **관리자 계정**: Administrator / admin

## 🔑 주요 기능

1. **대시보드** - 실시간 통계 및 활동 타임라인
<img width="1440" height="694" alt="image" src="https://github.com/user-attachments/assets/578b0358-c323-4b8e-b703-d3aa34671ac3" />
2. **공급자 관리** - 공급자 CRUD 및 필터링
3. **고객 관리** - 고객 정보 관리
4. **물품 등록** - 재고 물품 관리
5. **구매 주문** - 구매 주문 생성/관리
6. **판매 주문** - 판매 주문 생성/관리

## 🛠️ 개발 가이드
### E2E 테스트 자동화 (Playwright)

프론트엔드 E2E 테스트 자동화는 `apps/erpnext-frontend/test-playwright.sh` 스크립트로 실행할 수 있습니다.

실행 방법:
```bash
cd apps/erpnext-frontend
./test-playwright.sh
```

테스트가 실행되고, 결과 리포트가 자동으로 출력됩니다.

### 프론트엔드 개발

```bash
cd apps/erpnext-frontend

# 개발 서버 시작 (HMR 지원)
npm run dev

# 빌드
npm run build
```

### 백엔드 개발

```bash
docker exec -it erpnext-frappe bash
cd /workspace/frappe-bench

# 개발 서버 시작
bench start

# 마이그레이션
bench --site erpnext.local migrate

# 콘솔 접속
bench --site erpnext.local console
```


```
erpnext-dev/
├── README.md              # 이 파일
├── SETUP_GUIDE.md        # 완전한 설정 가이드 ⭐
├── backup.sh             # 자동 백업 스크립트
├── database-backup/      # DB 백업 저장소
├── docker-compose.yml    # Docker 설정
├── Dockerfile           # Docker 이미지
└── apps/
    ├── erpnext/         # ERPNext 백엔드
    ├── frappe/          # Frappe Framework
    └── erpnext-frontend/  # Next.js 프론트엔드 ⭐
        ├── src/
        │   ├── components/  # UI 컴포넌트
        │   ├── pages/       # 페이지 컴포넌트
        │   ├── services/    # API 서비스
        │   └── types/       # TypeScript 타입
        └── package.json
```

## 🔧 문제 해결

일반적인 문제와 해결 방법은 [SETUP_GUIDE.md - 문제 해결](./SETUP_GUIDE.md#문제-해결) 섹션을 참조하세요.

### 주요 문제 해결

**컨테이너가 시작되지 않는 경우:**
```bash
docker-compose logs
docker-compose restart
```

**CORS 오류:**
- `sites/erpnext.local/site_config.json`에 `allow_cors: "*"` 추가
- `bench restart`로 서버 재시작

**포트 충돌:**
```bash
# macOS/Linux
lsof -i :8100
kill -9 <PID>
```

## 📚 문서

- **완전한 설정 가이드**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [Frappe Framework 문서](https://frappeframework.com/docs)
- [ERPNext 문서](https://docs.erpnext.com/)
- [React 문서](https://react.dev/)

## 🤝 Git 워크플로우

```bash
# 프론트엔드 변경사항 커밋
git add apps/erpnext-frontend/
git commit -m "feat: 새 기능 추가"
```

## ⚠️ 주의사항

1. **프로덕션 사용 전 보안 설정 필수** (비밀번호 변경, CORS 제한 등)
2. Git에 민감한 정보 (비밀번호, API 키) 포함 금지

## 📄 라이선스

내부용 프로젝트. 외부 배포 금지.

---

**도움이 필요하신가요?**  
자세한 내용은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참조하거나 개발팀에 문의하세요.

**마지막 업데이트**: 2025년 11월 22일


```
erpnext-dev/
├── apps/                    # 애플리케이션 소스 코드
│   ├── frappe/             # Frappe Framework
│   └── erpnext/            # ERPNext
├── sites/                   # 사이트 데이터
├── config/                  # 설정 파일
├── logs/                    # 로그 파일
├── docker-compose.yml       # Docker Compose 설정
├── Dockerfile              # Docker 이미지 정의
├── .env                    # 환경 변수
├── setup.sh                # 초기 설정 스크립트
└── start.sh                # 서버 시작 스크립트
```

## ⚙️ 환경 변수 (.env)

```env
# 데이터베이스 설정
DB_ROOT_PASSWORD=admin
DB_NAME=erpnext_db
DB_USER=erpnext
DB_PASSWORD=admin

# 사이트 설정
SITE_NAME=erpnext.local

# 관리자 비밀번호
ADMIN_PASSWORD=admin
```

## 🔧 유용한 Docker 명령어

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 로그 확인
docker-compose logs -f frappe

# 컨테이너 재시작
docker-compose restart frappe

# 모든 컨테이너 중지
docker-compose down

# 볼륨 포함하여 모두 삭제 (주의!)
docker-compose down -v

# 이미지 재빌드
docker-compose build --no-cache
```

## 🐛 문제 해결

### 포트 충돌

8100 포트가 이미 사용 중인 경우 `docker-compose.yml`에서 포트를 변경:

```yaml
ports:
  - "8200:8000"  # 8200으로 변경
```

### 권한 문제

```bash
# 파일 소유권 수정
sudo chown -R $USER:$USER apps/ sites/
```

### 데이터베이스 연결 오류

```bash
# MariaDB 컨테이너 상태 확인
docker-compose logs mariadb

# MariaDB 재시작
docker-compose restart mariadb
```

### 캐시 클리어

```bash
# 컨테이너 내부에서
bench --site erpnext.local clear-cache
```

## 📚 추가 리소스

- [Frappe Framework 문서](https://frappeframework.com/docs)
- [ERPNext 문서](https://docs.erpnext.com/)
- [Bench 명령어 가이드](https://frappeframework.com/docs/user/en/bench)

## 🔐 보안 주의사항

이 환경은 **개발 목적**으로만 사용하세요. 프로덕션 환경에서는:
- 강력한 비밀번호 사용
- HTTPS 설정
- 방화벽 구성
- 정기적인 백업

## 📝 라이선스

이 프로젝트는 개발 환경 설정을 위한 것이며, Frappe와 ERPNext는 각각의 라이선스를 따릅니다.
