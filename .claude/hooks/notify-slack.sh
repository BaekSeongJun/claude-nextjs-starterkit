#!/bin/bash
set -euo pipefail

# UTF-8 인코딩 강제
export LC_ALL=C.UTF-8

# 스크립트 디렉토리 기준으로 .env 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

# stdin에서 JSON 읽기 (hook으로부터 받은 원본 JSON)
HOOK_INPUT="$(cat)"

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
  exit 0
fi

# Node.js에 전달할 데이터 구성 (모든 한글을 stdin으로만 전달, 명령줄 인자 사용 안 함)
# 이렇게 하면 명령줄 인자 인코딩 경로를 완전히 우회할 수 있음

# 기본 필드 추출 (Node.js로 파싱해서 프로젝트명만 추출, 한글은 다루지 않음)
CWD=$(echo "$HOOK_INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(d.cwd || '')" 2>/dev/null || echo "")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
PROJECT_NAME=$(basename "${CWD}" 2>/dev/null || echo "claude-project")

# Bash가 할 일을 최소화: ASCII 데이터(이벤트타입, 프로젝트명, 타임스탬프)만 조합
# 모든 한글 텍스트(message, detail)는 Node.js에게 일임

# Node.js build-payload.js에 전달할 입력 JSON 구성
# 이 부분에서 한글을 조합하지 않고, 원본 hook JSON을 그대로 전달해 Node.js가 처리
INPUT_FOR_NODE=$(cat <<EOF
{
  "eventType": "$EVENT_TYPE",
  "hookInput": $HOOK_INPUT,
  "timestamp": "$TIMESTAMP",
  "projectName": "$PROJECT_NAME"
}
EOF
)

# Node.js 빌드 스크립트 호출
# stdin: 위에서 구성한 JSON (ASCII + hook JSON 원본)
# stdout: Slack payload JSON
PAYLOAD=$(echo "$INPUT_FOR_NODE" | node "$SCRIPT_DIR/build-payload.js" 2>/dev/null)

# Payload가 있으면 Slack으로 전송
if [[ -n "$PAYLOAD" ]]; then
  RESPONSE=$(curl -s --max-time 5 \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "$SLACK_WEBHOOK_URL" 2>/dev/null)

  # Slack API 응답 검증 (실패는 stderr로만 기록, exit 0 유지)
  if [[ "$RESPONSE" != "ok" ]]; then
    echo "[notify-slack] Slack 전송 실패 (응답: $RESPONSE)" >&2
  fi
fi

exit 0
