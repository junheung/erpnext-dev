#!/bin/bash
#
# start-backend.sh
# ERPNext 백엔드 서버를 시작하는 스크립트입니다.
#
# 사용법:
#   ./start-backend.sh
#
# 또는 백그라운드에서 실행:
#   ./start-backend.sh &

set -e

echo "🚀 ERPNext 백엔드 서버 시작 중..."

# Docker 컨테이너가 실행 중인지 확인
if ! docker ps --filter "name=erpnext-frappe" --filter "status=running" --quiet | grep -q .; then
    echo "❌ ERPNext Frappe 컨테이너가 실행되지 않고 있습니다."
    echo "다음 명령어로 컨테이너를 시작하세요:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ ERPNext Frappe 컨테이너가 실행 중입니다."

# 기존 bench 프로세스가 있는지 확인하고 종료
echo "🔍 기존 bench 프로세스 확인 중..."
docker exec erpnext-frappe bash -c "ps aux | grep 'bench start' | grep -v grep" || echo "기존 bench 프로세스가 없습니다."

# ERPNext 백엔드 서버 시작
echo "🎯 ERPNext 백엔드 서버 시작..."
docker exec -d erpnext-frappe bash -c "cd /workspace/frappe-bench && bench start"

echo "⏳ 서버 시작 대기 중..."
sleep 5

# 서버 상태 확인
echo "🔍 서버 상태 확인 중..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8100 | grep -q "200\|302"; then
    echo "✅ ERPNext 백엔드 서버가 성공적으로 시작되었습니다!"
    echo ""
    echo "📍 접속 정보:"
    echo "  - URL: http://localhost:8100"
    echo "  - 사용자명: Administrator"
    echo "  - 비밀번호: admin (기본값, .env 파일 확인)"
    echo ""
    echo "🔧 유용한 명령어:"
    echo "  - 서버 로그 보기: docker-compose logs -f frappe"
    echo "  - 서버 재시작: docker-compose restart frappe"
    echo "  - 서버 중지: docker exec erpnext-frappe bash -c 'cd /workspace/frappe-bench && bench --site all stop'"
else
    echo "⚠️  서버가 아직 완전히 시작되지 않았거나 문제가 있을 수 있습니다."
    echo "몇 초 후 다시 http://localhost:8100 에 접속해보세요."
    echo ""
    echo "문제가 지속되면 로그를 확인하세요:"
    echo "  docker-compose logs frappe"
fi

echo ""
echo "참고: 이 스크립트는 백그라운드에서 서버를 시작합니다."
echo "서버를 중지하려면 다음 명령어를 사용하세요:"
echo "  docker exec erpnext-frappe bash -c 'pkill -f \"bench start\"'"
echo "  또는: docker-compose restart frappe"
