
#!/bin/bash
#
# 즉, ERPNext 개발 환경이 이미 초기화된 상태에서
# 서버를 바로 시작할 때 사용하는 "간편 실행용" 스크립트입니다.

# Start the development server
cd /workspace/frappe-bench

echo "Starting ERPNext Development Server..."
echo "Web UI: http://localhost:8100"
echo "Site: erpnext.local"
echo ""

# Start bench with all services
bench start
