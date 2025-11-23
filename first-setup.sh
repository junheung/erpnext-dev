#!/bin/bash
#
# first-setup.sh
# "최초 설치 또는 완전 초기화"를 한 번에 자동으로 처리하는 스크립트입니다.
# 기존 컨테이너/볼륨 완전 삭제 후, 모든 환경을 새로 생성합니다.
# .env 파일을 자동으로 읽어 ERPNext 사이트 생성, 앱 설치, CORS/개발모드 설정까지 한 번에 처리합니다.
# 프론트엔드 의존성 설치 및 개발 서버(HMR)까지 자동 실행합니다.
# 즉, 새 사용자가 소스를 받아서 바로 동일한 개발환경을 만들 때 가장 빠르고 간편하게 사용할 수 있습니다.

set -e

# .env 파일에서 환경 변수 로드
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "=========================================="
echo "ERPNext First Setup"
echo "=========================================="

docker-compose down -v
docker-compose up -d

echo "Waiting for MariaDB to be ready..."
sleep 15

echo "Initializing bench (downloading Frappe from GitHub)..."
docker-compose exec -T frappe bash -c "cd /workspace && bench init --skip-redis-config-generation --no-backups --skip-assets frappe-bench"

echo "Creating common_site_config.json..."
docker-compose exec -T frappe bash -c "cat > /workspace/frappe-bench/sites/common_site_config.json" << 'EOF'
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

echo "Creating new site (using SITE_NAME from .env: ${SITE_NAME:-erpnext.local})..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench new-site ${SITE_NAME:-erpnext.local} --db-root-username root --mariadb-root-password ${DB_ROOT_PASSWORD:-admin} --admin-password ${ADMIN_PASSWORD:-admin} --db-host mariadb --db-port 3306"

echo "Getting ERPNext app (downloading from GitHub)..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench get-app erpnext"

echo "Installing ERPNext to site..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench --site ${SITE_NAME:-erpnext.local} install-app erpnext"

echo "Setting default site..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench use ${SITE_NAME:-erpnext.local}"

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Site created: ${SITE_NAME:-erpnext.local}"
echo ""
echo "To start the server:"
echo "  docker-compose exec frappe bash"
echo "  cd /workspace/frappe-bench"
echo "  bench start"
echo ""
echo "Then access: http://localhost:8100"
echo "Login: Administrator / ${ADMIN_PASSWORD:-admin}"
echo ""
echo "Note: If you encounter database connection errors,"
echo "      the database users are auto-created by bench."
echo "      Just restart the frappe container:"
echo "      docker-compose restart frappe"
echo ""
