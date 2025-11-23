## ERPNext 15 기반 구매/판매 관리 시스템

ERPNext 15를 기반으로 한 통합 ERP 시스템입니다. Docker 환경에서 실행되며, Next.js 기반의 커스텀 프론트엔드를 제공합니다.

## ERPNext 사용 이유

1. 물류와 회계의 완전한 통합 구조 제공
재고 이동, 제조 투입, 생산 완료 등의 물류 활동이 발생하면 회계 분개가 자동 생성되고 원가 계산까지 실시간으로 반영됩니다. 물류와 회계를 별도 시스템처럼 관리할 필요 없이 단일 흐름으로 운영할 수 있습니다.

2. 가장 높은 수준의 커스터마이징 유연성
오픈소스 기반 프레임워크 구조로, 기업별 고유한 물류·제조·회계 프로세스를 제약 없이 구현할 수 있습니다. 예를 들어 3단계 검수, 특정 창고 이동 시 승인 절차 추가 등 실제 운영에 맞는 상세한 프로세스 적용이 가능합니다.

3. 정교한 원가 및 비용 통제 체계 제공
원가센터(Cost Center)를 기반으로 활동·부서·프로젝트별 원가 추적이 가능하여 경영 의사결정에 필요한 정확한 비용 통제 환경을 제공합니다. 단순 예산 관리 수준을 넘어 전체 원가 흐름을 투명하게 분석할 수 있습니다.

4. Lot / Serial 기반의 전사적 품목 추적 기능 지원
입고부터 제조, 판매, A/S까지 제품의 생애주기 전체를 추적할 수 있어 품질 관리가 중요한 산업에서 강력한 장점을 제공합니다. 문제 발생 시 특정 Lot의 생산·판매·출고 이력을 즉시 확인할 수 있습니다.

5. 제조·물류 중심의 시스템 확장에 최적화
BOM 기반 제조, 재고, 원가가 유기적으로 연결된 구조로 설계되어 있어 MES, SCM, WMS 등 물류 관련 시스템과의 연동이 용이하고 확장성이 뛰어납니다.

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

이 가이드에는 다음 내용이 포함되어 있습니다:
- ✅ 개발 워크플로우

### 초기 설정 (요약)

새 사용자가 소스를 받아서 바로 동일한 개발환경을 만들 때 가장 빠르고 간편한 방법:

```bash
# 1. .env 파일 확인 및 수정 (선택사항)
# .env 파일이 이미 제공되어 있습니다. 
# 사이트명, 비밀번호 등을 변경하려면 .env 파일을 수정하세요.

# 2. 모든 환경을 한 번에 자동 설정 (권장)
chmod +x first-setup.sh
./first-setup.sh
```

#### Windows (명령 프롬프트)
```cmd
REM 1. .env 파일 확인 및 수정 (선택사항)
REM .env 파일이 이미 제공되어 있습니다. 
REM 사이트명, 비밀번호 등을 변경하려면 .env 파일을 수정하세요.

REM 2. 모든 환경을 한 번에 자동 설정 (권장)
first-setup.cmd
```


**또는 수동 설정:**

```bash
# 1. Docker 컨테이너 시작
docker-compose up -d

# 2. 로그 디렉토리 권한 설정
docker-compose exec -T --user root frappe bash -c "mkdir -p /workspace/logs && chown -R frappe:frappe /workspace/logs && chmod 755 /workspace/logs"
docker-compose exec -T --user root frappe bash -c "chown -R frappe:frappe /workspace"

# 3. Frappe 벤치 초기화
docker-compose exec -T --user frappe frappe bash -c "cd /workspace && bench init --skip-redis-config-generation --no-backups --skip-assets frappe-bench"

# 4. common_site_config.json 생성
docker-compose exec -T --user frappe frappe bash -c "cat > /workspace/frappe-bench/sites/common_site_config.json" << 'EOF'
{
  "background_workers": 1,
  "file_watcher_port": 6787,
  "frappe_user": "frappe",
  "gunicorn_workers": 4,
  "live_reload": true,
  "rebase_on_pull": false,
  "redis_cache": "redis://redis-cache:6379",
  "redis_queue": "redis://redis-queue:6379",
  "restart_supervisor_on_update": false,
  "restart_systemd_on_update": false,
  "serve_default_site": true,
  "shallow_clone": true,
  "socketio_port": 9000,
  "webserver_port": 8000,
  "developer_mode": 1
}
EOF

# 5. 사이트 생성
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench new-site erpnext.local --db-root-username root --mariadb-root-password admin --admin-password admin --db-host mariadb --db-port 3306"

# 6. ERPNext 앱 설치
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench get-app erpnext"
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site erpnext.local install-app erpnext"
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench use erpnext.local"

# 7. 개발 환경 설정
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site erpnext.local set-config ignore_csrf 1"
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site erpnext.local set-config developer_mode 1"
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site erpnext.local set-config allow_cors '*'"
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site erpnext.local set-config disable_website_cache 1"

# 8. 백엔드 서버 시작
docker-compose exec -d --user frappe frappe bash -c "cd /workspace/frappe-bench && bench start"

# 9. 프론트엔드 실행 (새 터미널)
cd apps/erpnext-frontend
npm install
npm run dev
```

### 접속 정보

- **백엔드/프론트엔드(ERPNext)**: http://localhost:8100
- **프론트엔드**: http://localhost:8300
- **관리자 계정**: Administrator / admin

## 🔑 주요 기능

1. **대시보드** - 실시간 통계 및 활동 타임라인
<img width="1440" height="694" alt="image" src="https://github.com/user-attachments/assets/578b0358-c323-4b8e-b703-d3aa34671ac3" />

2. **공급자 관리** - 공급자 CRUD 및 필터링
<img width="1439" height="698" alt="image" src="https://github.com/user-attachments/assets/66aae2da-146f-4688-ad59-ef3965365bc1" />

3. **고객 관리** - 고객 정보 관리
<img width="1439" height="694" alt="image" src="https://github.com/user-attachments/assets/6f42c4da-615d-439c-b28a-a574766cecdf" />

4. **물품 등록** - 재고 물품 관리
<img width="1440" height="694" alt="image" src="https://github.com/user-attachments/assets/b2b3b4d8-8cb3-4fa9-8e3c-4a2c0fc684b8" />

5. **구매 주문** - 구매 주문 생성/관리
<img width="1439" height="694" alt="image" src="https://github.com/user-attachments/assets/10290043-4fe8-47ac-b9b7-939693eee001" />

6. **판매 주문** - 판매 주문 생성/관리
<img width="1437" height="695" alt="image" src="https://github.com/user-attachments/assets/3dc87f3d-105f-443c-8538-5f94453237f9" />

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
```


```
erpnext-dev/
├── README.md              # 이 파일
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

- [Frappe Framework 문서](https://frappeframework.com/docs)
- [ERPNext 문서](https://docs.erpnext.com/)

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
