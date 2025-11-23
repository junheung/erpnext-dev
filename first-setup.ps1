# ERPNext First Setup for Windows (PowerShell)
# 
# first-setup.ps1
# Windows 사용자를 위한 ERPNext 최초 설치 또는 완전 초기화 스크립트입니다.
# 기존 컨테이너/볼륨을 완전 삭제 후, 모든 환경을 새로 생성합니다.
# .env 파일을 자동으로 읽어 ERPNext 사이트 생성, 앱 설치, CORS/개발모드 설정까지 한 번에 처리합니다.
# 
# 실행 방법:
# 1. PowerShell을 관리자 권한으로 실행
# 2. Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# 3. .\first-setup.ps1

param(
    [switch]$Force,
    [switch]$Help
)

if ($Help) {
    Write-Host "ERPNext First Setup for Windows" -ForegroundColor Green
    Write-Host "Usage: .\first-setup.ps1 [-Force] [-Help]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Force    기존 데이터를 강제로 삭제하고 재설치"
    Write-Host "  -Help     이 도움말을 표시"
    Write-Host ""
    Write-Host "Requirements:"
    Write-Host "  - Docker Desktop for Windows"
    Write-Host "  - PowerShell 5.1 또는 PowerShell Core"
    Write-Host "  - 관리자 권한 (권장)"
    exit 0
}

# 에러 발생 시 스크립트 중단
$ErrorActionPreference = "Stop"

# .env 파일에서 환경 변수 로드
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Blue
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]*?)=(.*)$") {
            $name = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Warning ".env 파일이 없습니다. 기본값을 사용합니다."
}

# 환경 변수 기본값 설정
$env:DB_ROOT_PASSWORD = if ($env:DB_ROOT_PASSWORD) { $env:DB_ROOT_PASSWORD } else { "admin" }
$env:ADMIN_PASSWORD = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { "admin" }
$env:SITE_NAME = if ($env:SITE_NAME) { $env:SITE_NAME } else { "erpnext.local" }

Write-Host "==========================================" -ForegroundColor Green
Write-Host "ERPNext First Setup for Windows" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Docker 상태 확인
Write-Host "🔍 Docker 상태 확인 중..." -ForegroundColor Blue

# Docker 데몬이 실행 중인지 확인
try {
    docker info | Out-Null
    Write-Host "✅ Docker가 정상적으로 실행 중입니다." -ForegroundColor Green
} catch {
    Write-Host "❌ Docker가 실행되지 않았습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음을 확인해주세요:" -ForegroundColor Yellow
    Write-Host "  - Docker Desktop for Windows가 설치되어 있는지 확인"
    Write-Host "  - Docker Desktop이 실행 중인지 확인"
    Write-Host "  - WSL2가 활성화되어 있는지 확인 (Windows 10/11)"
    Write-Host ""
    exit 1
}

# Docker Compose 설치 확인
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose가 사용 가능합니다." -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose가 설치되지 않았습니다!" -ForegroundColor Red
    Write-Host "Docker Desktop for Windows를 최신 버전으로 업데이트하거나 Docker Compose를 설치해주세요." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 사용자 확인 (Force 옵션이 없는 경우)
if (-not $Force) {
    Write-Host "⚠️  이 작업은 기존의 모든 ERPNext 데이터를 삭제합니다!" -ForegroundColor Yellow
    $response = Read-Host "계속하시겠습니까? (y/N)"
    if ($response -notmatch "^[Yy]") {
        Write-Host "작업이 취소되었습니다." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "🧹 기존 컨테이너 및 볼륨 정리 중..." -ForegroundColor Blue
try {
    docker-compose down -v
    Write-Host "✅ 기존 환경이 정리되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "기존 환경 정리 중 오류가 발생했지만 계속 진행합니다."
}

Write-Host "🚀 새 환경 구축 시작..." -ForegroundColor Blue
try {
    docker-compose up -d
    Write-Host "✅ Docker 컨테이너가 시작되었습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ Docker 컨테이너 시작에 실패했습니다." -ForegroundColor Red
    Write-Host "docker-compose logs 명령으로 자세한 로그를 확인하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "⏳ MariaDB 초기화 대기 중..." -ForegroundColor Blue

# MariaDB 상태 확인 (최대 60초 대기)
$maxAttempts = 12
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    $attempt++
    Write-Host "🔍 MariaDB 연결 상태 확인... ($attempt/$maxAttempts)" -ForegroundColor Blue
    
    try {
        $result = docker-compose exec -T mariadb mysqladmin ping -h localhost -u root -p"$env:DB_ROOT_PASSWORD" --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MariaDB가 준비되었습니다!" -ForegroundColor Green
            $dbReady = $true
        } else {
            throw "MariaDB not ready"
        }
    } catch {
        Write-Host "⏳ MariaDB 대기 중... ($attempt/$maxAttempts)" -ForegroundColor Blue
        Start-Sleep 5
    }
}

# 마지막으로 한 번 더 확인
if (-not $dbReady) {
    try {
        $result = docker-compose exec -T mariadb mysqladmin ping -h localhost -u root -p"$env:DB_ROOT_PASSWORD" --silent 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "MariaDB connection failed"
        }
        Write-Host "✅ MariaDB가 준비되었습니다!" -ForegroundColor Green
    } catch {
        Write-Host "❌ MariaDB 연결에 실패했습니다. 로그를 확인해주세요:" -ForegroundColor Red
        Write-Host "   docker-compose logs mariadb" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🔧 Frappe 벤치 초기화 중..." -ForegroundColor Blue

# 로그 디렉토리 권한 설정
Write-Host "📁 로그 디렉토리 권한 설정 중..." -ForegroundColor Blue
try {
    docker-compose exec -T --user root frappe bash -c "mkdir -p /workspace/logs && chown -R frappe:frappe /workspace/logs && chmod 755 /workspace/logs"
    docker-compose exec -T --user root frappe bash -c "chown -R frappe:frappe /workspace"
    Write-Host "✅ 권한 설정이 완료되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "권한 설정 중 오류가 발생했지만 계속 진행합니다."
}

# Frappe 벤치 초기화
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace && bench init --skip-redis-config-generation --no-backups --skip-assets frappe-bench"
    Write-Host "✅ Frappe 벤치 초기화가 완료되었습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ Frappe 벤치 초기화에 실패했습니다." -ForegroundColor Red
    exit 1
}

Write-Host "📄 공통 사이트 설정 생성 중..." -ForegroundColor Blue
$commonSiteConfig = @"
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
"@

try {
    $commonSiteConfig | docker-compose exec -T --user frappe frappe bash -c "cat > /workspace/frappe-bench/sites/common_site_config.json"
    Write-Host "✅ 공통 사이트 설정이 생성되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "공통 사이트 설정 생성 중 오류가 발생했습니다."
}

Write-Host "🌐 새 사이트 생성 중 (사이트명: $env:SITE_NAME)..." -ForegroundColor Blue
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench new-site $env:SITE_NAME --db-root-username root --mariadb-root-password $env:DB_ROOT_PASSWORD --admin-password $env:ADMIN_PASSWORD --db-host mariadb --db-port 3306"
    Write-Host "✅ 사이트가 성공적으로 생성되었습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ 사이트 생성에 실패했습니다." -ForegroundColor Red
    exit 1
}

Write-Host "📦 ERPNext 앱 다운로드 중 (GitHub에서)..." -ForegroundColor Blue
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench get-app erpnext"
    Write-Host "✅ ERPNext 앱이 다운로드되었습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ ERPNext 앱 다운로드에 실패했습니다." -ForegroundColor Red
    exit 1
}

Write-Host "⚙️ 사이트에 ERPNext 설치 중..." -ForegroundColor Blue
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site $env:SITE_NAME install-app erpnext"
    Write-Host "✅ ERPNext가 사이트에 설치되었습니다." -ForegroundColor Green
} catch {
    Write-Host "❌ ERPNext 설치에 실패했습니다." -ForegroundColor Red
    exit 1
}

Write-Host "🎯 기본 사이트 설정 중..." -ForegroundColor Blue
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench use $env:SITE_NAME"
    Write-Host "✅ 기본 사이트가 설정되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "기본 사이트 설정 중 오류가 발생했습니다."
}

Write-Host "� 개발 환경 설정 중..." -ForegroundColor Blue
try {
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site $env:SITE_NAME set-config ignore_csrf 1"
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site $env:SITE_NAME set-config developer_mode 1"
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site $env:SITE_NAME set-config allow_cors '*'"
    docker-compose exec -T --user frappe frappe bash -c "cd /workspace/frappe-bench && bench --site $env:SITE_NAME set-config disable_website_cache 1"
    Write-Host "✅ 개발 환경 설정이 완료되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "개발 환경 설정 중 오류가 발생했습니다."
}

Write-Host "�🚀 ERPNext 백엔드 서버 시작 중..." -ForegroundColor Blue
try {
    # PowerShell에서 백그라운드 작업 시작
    Start-Process docker-compose -ArgumentList "exec", "-d", "--user", "frappe", "frappe", "bash", "-c", "cd /workspace/frappe-bench && bench start" -NoNewWindow
    Write-Host "✅ 백엔드 서버가 시작되었습니다." -ForegroundColor Green
} catch {
    Write-Warning "백엔드 서버 시작 중 오류가 발생했습니다. 수동으로 시작해주세요."
}

Write-Host "⏳ ERPNext 서버 시작 대기 중..." -ForegroundColor Blue
Start-Sleep 10

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ 설치 완료!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 접속 주소:" -ForegroundColor Blue
Write-Host "  ERPNext 백엔드: http://localhost:8100" -ForegroundColor White
Write-Host "  프론트엔드 앱:  http://localhost:8300" -ForegroundColor White
Write-Host "  프론트엔드 앱 로컬(개발): http://localhost:3000 (별도 실행 필요)" -ForegroundColor White
Write-Host ""
Write-Host "🔑 로그인 정보:" -ForegroundColor Blue
Write-Host "  사용자명: Administrator" -ForegroundColor White
Write-Host "  비밀번호: $env:ADMIN_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "📁 생성된 사이트: $env:SITE_NAME" -ForegroundColor Blue
Write-Host ""
Write-Host "🔧 유용한 명령어:" -ForegroundColor Blue
Write-Host "  백엔드 서버 로그:   docker-compose logs -f frappe" -ForegroundColor White
Write-Host "  백엔드 재시작:      docker-compose restart frappe" -ForegroundColor White
Write-Host "  프론트엔드 시작:    cd apps/erpnext-frontend && npm install && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Windows 사용자를 위한 팁:" -ForegroundColor Blue
Write-Host "  - Git Bash 사용 권장: bash ./first-setup.sh" -ForegroundColor White
Write-Host "  - PowerShell 실행 정책: Set-ExecutionPolicy RemoteSigned" -ForegroundColor White
Write-Host "  - 관리자 권한으로 실행하면 더 안정적입니다" -ForegroundColor White
Write-Host ""
Write-Host "참고: 데이터베이스 연결 오류가 발생하면," -ForegroundColor Yellow
Write-Host "      데이터베이스 사용자는 bench에 의해 자동으로 생성됩니다." -ForegroundColor Yellow
Write-Host "      frappe 컨테이너를 재시작하세요:" -ForegroundColor Yellow
Write-Host "      docker-compose restart frappe" -ForegroundColor Yellow
Write-Host ""
