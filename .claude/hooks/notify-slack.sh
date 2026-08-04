#!/bin/bash
set -euo pipefail

# UTF-8 강제 + Windows 콘솔 코드페이지 강제 전환
export LC_ALL=C.UTF-8
cmd.exe /c "chcp 65001" > /dev/null 2>&1 || true

# 스크립트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# .env 파일 로드
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# Webhook URL 미설정 시 조용히 종료
if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  exit 0
fi

# 이벤트 타입 (notification 또는 stop)
EVENT_TYPE="${1:-}"

# stdin에서 JSON 읽기 (hook으로부터 받은 원본)
HOOK_INPUT="$(cat)"

# Node.js 미설치 확인
if ! command -v node &> /dev/null; then
  exit 0
fi

# 프로젝트명 추출 (CWD로부터)
CWD=$(echo "$HOOK_INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.cwd || '')" 2>/dev/null || echo "")
PROJECT_NAME=$(basename "${CWD}" 2>/dev/null || echo "claude-project")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Bash가 할 일: 최소한의 ASCII 데이터만 조합
# 모든 한글 텍스트는 Node.js가 stdin JSON에서 처리
INPUT_FOR_NODE=$(cat <<EOF
{
  "eventType": "$EVENT_TYPE",
  "hookInput": $HOOK_INPUT,
  "timestamp": "$TIMESTAMP",
  "projectName": "$PROJECT_NAME",
  "webhookUrl": "$SLACK_WEBHOOK_URL"
}
EOF
)

# Node.js send-slack.js에 JSON을 stdin으로 전달
# Node.js가 payload 생성과 Slack 전송까지 전부 처리
echo "$INPUT_FOR_NODE" | node "$SCRIPT_DIR/send-slack.js" 2>/dev/null || true

exit 0
