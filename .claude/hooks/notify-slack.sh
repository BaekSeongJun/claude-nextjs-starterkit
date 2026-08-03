#!/bin/bash
set -euo pipefail

# UTF-8 인코딩 강제 (Git Bash의 시스템 코드페이지 문제 방지)
export LC_ALL=C.UTF-8

# 스크립트 디렉토리 기준으로 .env 파일 로드
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# Webhook URL이 설정되지 않았으면 조용히 종료 (작업 방해 금지)
if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  exit 0
fi

# 이벤트 타입 (notification 또는 stop)
EVENT_TYPE="${1:-}"

# stdin에서 JSON 읽기
HOOK_INPUT="$(cat)"

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
  exit 0
fi

# 기본 필드 추출 (Node.js로 JSON 파싱)
SESSION_ID=$(echo "$HOOK_INPUT" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(data.session_id || 'unknown')" 2>/dev/null || echo "unknown")
CWD=$(echo "$HOOK_INPUT" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(data.cwd || '')" 2>/dev/null || echo "")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 프로젝트명 (cwd의 basename)
PROJECT_NAME=$(basename "${CWD}" 2>/dev/null || echo "claude-project")

# 이벤트별 처리
case "$EVENT_TYPE" in
  notification)
    # 권한 요청 알림
    MESSAGE=$(echo "$HOOK_INPUT" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(data.message || 'Permission request')" 2>/dev/null || echo "Permission request")
    EMOJI=":bell:"
    USERNAME="PermissionBot"
    DETAIL="$MESSAGE"
    ;;
  stop)
    # 작업 완료 알림
    EMOJI=":white_check_mark:"
    USERNAME="CompleteBot"
    DETAIL="세션이 종료되었습니다."
    ;;
  *)
    # 알 수 없는 이벤트 타입
    exit 0
    ;;
esac

# Slack Webhook payload 생성 (Node.js로 한글 안전하게 처리)
PAYLOAD=$(node -e "
const emoji = '$EMOJI';
const project = '$PROJECT_NAME';
const event_type = '$EVENT_TYPE';
const timestamp = '$TIMESTAMP';
const detail = '$DETAIL';
const session_id = '$SESSION_ID';
const username = '$USERNAME';

const text = emoji + ' ' + project + ' | ' + event_type + '\n시각: ' + timestamp + '\n' + detail + '\n(Session: ' + session_id + ')';

const payload = {
  channel: '#ai-claude',
  username: username,
  text: text
};

console.log(JSON.stringify(payload));
" 2>/dev/null)

# Slack으로 전송 (타임아웃 5초, 실패해도 에러 코드 반환 안함)
if [[ -n "$PAYLOAD" ]]; then
  RESPONSE=$(curl -s --max-time 5 \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    "$SLACK_WEBHOOK_URL" 2>/dev/null)

  # Slack API 응답이 "ok"인지 확인 (실패는 최소 진단용 stderr로만 기록)
  if [[ "$RESPONSE" != "ok" ]]; then
    echo "[notify-slack] Slack 전송 실패 (응답: $RESPONSE)" >&2
  fi
fi

exit 0
