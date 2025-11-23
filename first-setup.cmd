@echo off
REM ERPNext First Setup for Windows (Batch)
REM
REM first-setup.cmd
REM Windows 사용자를 위한 ERPNext 최초 설치 또는 완전 초기화 스크립트입니다.
REM 기존 컨테이너/볼륨을 완전 삭제 후, 모든 환경을 새로 생성합니다.
REM
REM 실행 방법:
REM 1. 명령 프롬프트를 관리자 권한으로 실행 (권장)
REM 2. first-setup.cmd

setlocal enabledelayedexpansion

REM .env 파일에서 환경 변수 로드
if exist .env (
    echo Loading environment variables from .env file...
    for /f "eol=# delims== tokens=1,2" %%i in (.env) do (
        set "%%i=%%j"
    )
) else (
    echo WARNING: .env 파일이 없습니다. 기본값을 사용합니다.
)

REM 환경 변수 기본값 설정
if not defined DB_ROOT_PASSWORD set DB_ROOT_PASSWORD=admin
if not defined ADMIN_PASSWORD set ADMIN_PASSWORD=admin
if not defined SITE_NAME set SITE_NAME=erpnext.local

echo ==========================================
echo ERPNext First Setup for Windows
echo ==========================================
echo.

REM Docker 상태 확인
echo 🔍 Docker 상태 확인 중...

REM Docker 데몬이 실행 중인지 확인
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker가 실행되지 않았습니다!
    echo.
    echo 다음을 확인해주세요:
    echo   - Docker Desktop for Windows가 설치되어 있는지 확인
    echo   - Docker Desktop이 실행 중인지 확인
    echo   - WSL2가 활성화되어 있는지 확인 ^(Windows 10/11^)
    echo.
    pause
    exit /b 1
)

echo ✅ Docker가 정상적으로 실행 중입니다.

REM Docker Compose 설치 확인
docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose가 설치되지 않았습니다!
    echo Docker Desktop for Windows를 최신 버전으로 업데이트하거나 Docker Compose를 설치해주세요.
    pause
    exit /b 1
)

echo ✅ Docker Compose가 사용 가능합니다.
echo.

REM 사용자 확인
echo ⚠️  이 작업은 기존의 모든 ERPNext 데이터를 삭제합니다!
set /p "response=계속하시겠습니까? (y/N): "
if /i not "%response%"=="y" (
    echo 작업이 취소되었습니다.
    pause
    exit /b 0
)

echo 🧹 기존 컨테이너 및 볼륨 정리 중...
docker-compose down -v
if errorlevel 1 (
    echo WARNING: 기존 환경 정리 중 오류가 발생했지만 계속 진행합니다.
) else (
    echo ✅ 기존 환경이 정리되었습니다.
)

echo 🚀 새 환경 구축 시작...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Docker 컨테이너 시작에 실패했습니다.
    echo docker-compose logs 명령으로 자세한 로그를 확인하세요.
    pause
    exit /b 1
)

echo ✅ Docker 컨테이너가 시작되었습니다.

echo ⏳ MariaDB 초기화 대기 중...

REM MariaDB 상태 확인 (최대 60초 대기)
set /a maxAttempts=12
set /a attempt=0

:checkdb
set /a attempt+=1
echo 🔍 MariaDB 연결 상태 확인... (!attempt!/!maxAttempts!)

docker-compose exec -T mariadb mysqladmin ping -h localhost -u root -p%DB_ROOT_PASSWORD% --silent >nul 2>&1
if not errorlevel 1 (
    echo ✅ MariaDB가 준비되었습니다!
    goto dbready
)

if !attempt! geq !maxAttempts! goto dbfail

echo ⏳ MariaDB 대기 중... (!attempt!/!maxAttempts!)
timeout /t 5 /nobreak >nul
goto checkdb

:dbfail
echo ❌ MariaDB 연결에 실패했습니다. 로그를 확인해주세요:
echo    docker-compose logs mariadb
pause
exit /b 1

:dbready
echo 🔧 Frappe 벤치 초기화 중...

REM 로그 디렉토리 권한 설정
echo 📁 로그 디렉토리 권한 설정 중...
docker-compose exec -T --user root frappe bash -c "mkdir -p /workspace/logs && chown -R frappe:frappe /workspace/logs && chmod 755 /workspace/logs"
docker-compose exec -T --user root frappe bash -c "chown -R frappe:frappe /workspace"
if errorlevel 1 (
    echo WARNING: 권한 설정 중 오류가 발생했지만 계속 진행합니다.
) else (
    echo ✅ 권한 설정이 완료되었습니다.
)

REM Frappe 벤치 초기화
docker-compose exec -T --user frappe frappe bash -c "cd /workspace && bench init --skip-redis-config-generation --no-backups --skip-assets frappe-bench"
if errorlevel 1 (
    echo ❌ Frappe 벤치 초기화에 실패했습니다.
    pause
    exit /b 1
)

echo ✅ Frappe 벤치 초기화가 완료되었습니다.

echo 📄 공통 사이트 설정 생성 중...
echo { ^
  "background_workers": 1, ^
  "file_watcher_port": 6787, ^
  "frappe_user": "frappe", ^
  "gunicorn_workers": 4, ^
  "live_reload": true, ^
  "rebase_on_pull": false, ^
  "redis_cache": "redis://redis-cache:6379", ^
  "redis_queue": "redis://redis-queue:6379", ^
  "restart_supervisor_on_update": false, ^
  "restart_systemd_on_update": false, ^
  "serve_default_site": true, ^
  "shallow_clone": true, ^
  "socketio_port": 9000, ^
  "webserver_port": 8000, ^
  "developer_mode": 1 ^
} | docker-compose exec -T --user frappe frappe bash -c "cat > /workspace/frappe-bench/sites/common_site_config.json"

if errorlevel 1 (
    echo WARNING: 공통 사이트 설정 생성 중 오류가 발생했습니다.
) else (
    echo ✅ 공통 사이트 설정이 생성되었습니다.
)

echo 🌐 새 사이트 생성 중 ^(사이트명: %SITE_NAME%^)...
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench new-site %SITE_NAME% --db-root-username root --mariadb-root-password %DB_ROOT_PASSWORD% --admin-password %ADMIN_PASSWORD% --db-host mariadb --db-port 3306"
if errorlevel 1 (
    echo ❌ 사이트 생성에 실패했습니다.
    pause
    exit /b 1
)

echo ✅ 사이트가 성공적으로 생성되었습니다.

echo 📦 ERPNext 앱 다운로드 중 ^(GitHub에서^)...
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench get-app erpnext"
if errorlevel 1 (
    echo ❌ ERPNext 앱 다운로드에 실패했습니다.
    pause
    exit /b 1
)

echo ✅ ERPNext 앱이 다운로드되었습니다.

echo ⚙️ 사이트에 ERPNext 설치 중...
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site %SITE_NAME% install-app erpnext"
if errorlevel 1 (
    echo ❌ ERPNext 설치에 실패했습니다.
    pause
    exit /b 1
)

echo ✅ ERPNext가 사이트에 설치되었습니다.

echo 🎯 기본 사이트 설정 중...
docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench use %SITE_NAME%"
if errorlevel 1 (
    echo WARNING: 기본 사이트 설정 중 오류가 발생했습니다.
) else (
    echo ✅ 기본 사이트가 설정되었습니다.
)

echo 🚀 ERPNext 백엔드 서버 시작 중...
start /b docker-compose exec -d --user frappe frappe bash -c "cd /workspace/frappe-bench && bench start"
echo ✅ 백엔드 서버가 시작되었습니다.

echo ⏳ ERPNext 서버 시작 대기 중...
timeout /t 10 /nobreak >nul

echo.
echo ==========================================
echo ✅ 설치 완료!
echo ==========================================
echo.
echo 🌍 접속 주소:
echo   ERPNext 백엔드: http://localhost:8100
echo   프론트엔드 앱:  http://localhost:8300
echo   프론트엔드 앱 로컬^(개발^): http://localhost:3000 ^(별도 실행 필요^)
echo.
echo 🔑 로그인 정보:
echo   사용자명: Administrator
echo   비밀번호: %ADMIN_PASSWORD%
echo.
echo 📁 생성된 사이트: %SITE_NAME%
echo.
echo 🔧 유용한 명령어:
echo   백엔드 서버 로그:   docker-compose logs -f frappe
echo   백엔드 재시작:      docker-compose restart frappe
echo   프론트엔드 시작:    cd apps/erpnext-frontend ^&^& npm install ^&^& npm run dev
echo.
echo 💡 Windows 사용자를 위한 팁:
echo   - Git Bash 사용 권장: bash ./first-setup.sh
echo   - PowerShell 스크립트: .\first-setup.ps1
echo   - 관리자 권한으로 실행하면 더 안정적입니다
echo.
echo 참고: 데이터베이스 연결 오류가 발생하면,
echo       데이터베이스 사용자는 bench에 의해 자동으로 생성됩니다.
echo       frappe 컨테이너를 재시작하세요:
echo       docker-compose restart frappe
echo.
pause
