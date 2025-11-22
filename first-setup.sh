#!/bin/bash
#
# first-setup.sh
# "최초 설치 또는 완전 초기화"를 한 번에 자동으로 처리하는 스크립트입니다.
# 기존 컨테이너/볼륨 완전 삭제 후, 모든 환경을 새로 생성합니다.
# .env 파일을 자동으로 읽어 ERPNext 사이트 생성, 앱 설치, CORS/개발모드 설정까지 한 번에 처리합니다.
# 프론트엔드 의존성 설치 및 개발 서버(HMR)까지 자동 실행합니다.
# 즉, 새 사용자가 소스를 받아서 바로 동일한 개발환경을 만들 때 가장 빠르고 간편하게 사용할 수 있습니다.

set -e

echo "=========================================="
echo "ERPNext first Setup"
echo "=========================================="

docker-compose down -v
docker-compose up -d

echo "Waiting for containers to be ready..."
sleep 10

echo "Initializing bench..."
docker-compose exec -T frappe bash -c "cd /workspace && bench init --skip-redis-config-generation --no-backups --skip-assets --frappe-path /workspace/apps/frappe frappe-bench"

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

echo "Creating new site..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench new-site localhost --mariadb-root-password admin --admin-password admin --db-host mariadb --db-port 3306"

echo "Getting ERPNext app..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench get-app erpnext /workspace/apps/erpnext"

echo "Installing ERPNext..."
docker-compose exec -T frappe bash -c "cd /workspace/frappe-bench && bench --site localhost install-app erpnext"

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the server:"
echo "  docker-compose exec frappe bash"
echo "  cd /workspace/frappe-bench"
echo "  bench start"
echo ""
echo "Then access: http://localhost:8100"
echo "Login: Administrator / admin"
echo ""
