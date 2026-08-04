# Claude Code → Slack 모바일 알림 설정 가이드

Claude Code 작업 중 권한 요청 또는 작업 완료 시 모바일 Slack 앱으로 즉시 알림을 받을 수 있습니다.

## 📋 현재 상태

이미 구현되어 있는 것:
- ✅ `.claude/hooks/notify-slack.sh` — Notification/Stop 이벤트 훅 스크립트
- ✅ `.claude/hooks/.env` — Webhook URL 보관 (`.gitignore` 처리됨)
- ✅ `.claude/settings.local.json` — hooks 등록 완료
- ✅ `.gitignore` — 민감 정보 보호

**사용자가 할 일:** 없음! 이미 모든 설정이 완료되었고, 리포지토리를 `git pull`하면 바로 작동합니다.

## 🚀 동작 원리

### 두 가지 알림 시나리오

**1️⃣ 권한 요청 시 (Notification 이벤트)**
- Claude Code가 도구/커맨드 실행 승인을 대기 중일 때 자동 발송
- **봇**: PermissionBot 🔔
- **메시지**: 요청된 도구와 이유를 포함 (예: "Claude needs your permission to use Bash")

**2️⃣ 작업 완료 시 (Stop 이벤트)**
- Claude Code 세션이 종료되거나 응답이 완료될 때 자동 발송
- **봇**: CompleteBot ✅
- **메시지**: 세션 종료 시점과 프로젝트명 포함

### Slack 채널

모든 알림은 **`#ai-claude`** 채널에 전송됩니다.

## 🔧 기술 상세

### 파일 구조

```
.claude/
├── hooks/
│   ├── notify-slack.sh      # 핵심 훅 스크립트
│   └── .env                  # Webhook URL (git 무시됨)
├── settings.local.json       # hooks 등록 (로컬 설정, git 무시됨)
└── docs/
    └── slack-notification-setup.md  # 이 파일
```

### `.claude/hooks/notify-slack.sh` 주요 기능

- **Webhook URL 자동 로드**: 스크립트 시작부에서 `.env` 파일을 `source`로 읽음
- **이벤트 구분**: `notification` 또는 `stop` 인자로 처리 분기
- **한글 안전**: `export LC_ALL=C.UTF-8` + `jq -n --arg`로 UTF-8 강제
- **비동기 실행**: `curl --max-time 5` + `|| true`로 실패해도 영향 없음
- **JSON 안전성**: payload는 `jq`로 생성해서 특수 문자/줄바꿈/따옴표 자동 이스케이프

### `.claude/settings.local.json` 훅 등록

```json
{
  "hooks": {
    "Notification": [{
      "hooks": [{
        "type": "command",
        "command": "bash .claude/hooks/notify-slack.sh notification",
        "async": true
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "bash .claude/hooks/notify-slack.sh stop",
        "async": true
      }]
    }]
  }
}
```

`async: true`로 등록되어 있어, Slack 전송 중에도 Claude Code 작업이 진행되도록 보장합니다.

## 🧪 테스트 방법

### 1. 스크립트 단독 테스트 (Git Bash)

**권한 요청 알림 시뮬레이션:**
```bash
echo '{"session_id":"test-001","message":"Claude needs your permission to use Bash"}' \
  | bash .claude/hooks/notify-slack.sh notification
```

**작업 완료 알림 시뮬레이션:**
```bash
echo '{"session_id":"test-002","cwd":"D:/claude/claude-nextjs-staterkit"}' \
  | bash .claude/hooks/notify-slack.sh stop
```

Slack `#ai-claude` 채널에 다음과 같은 메시지가 도착해야 합니다:

**권한 요청:**
```
🔔 claude-nextjs-staterkit | notification
시각: 2026-08-03 17:53:00
Claude needs your permission to use Bash
(Session: test-001)
```

**작업 완료:**
```
✅ claude-nextjs-staterkit | stop
시각: 2026-08-03 17:53:15
세션이 종료되었습니다.
(Session: test-002)
```

### 2. 실제 Claude Code에서 테스트

1. Claude Code에서 `/hooks` 명령 입력 — 설정을 리로드합니다 (선택 사항)
2. 권한이 필요한 도구(예: `Bash` 명령)를 Claude가 실행하려 할 때:
   - 권한 요청 프롬프트가 뜨면 → **Slack에 🔔 알림 도착**
3. Claude가 응답 완료 또는 세션 종료 시:
   - **Slack에 ✅ 알림 도착**

### 3. 문제 진단

**Slack 메시지가 안 올 경우:**

1. **Webhook URL 확인**
   ```bash
   cat .claude/hooks/.env
   ```
   URL이 `https://hooks.slack.com/services/...` 형식인지 확인

2. **스크립트 권한 확인**
   ```bash
   ls -la .claude/hooks/notify-slack.sh
   # -rwxr-xr-x 권한이어야 함
   ```

3. **수동 curl 테스트** (고급)
   ```bash
   source .claude/hooks/.env
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"channel":"#ai-claude","username":"TestBot","text":"테스트 메시지"}' \
     "$SLACK_WEBHOOK_URL"
   ```

4. **Claude Code 세션 재시작**
   - 설정 변경 후 Claude Code를 완전히 종료했다가 다시 시작해야 hooks가 로드됩니다

## 🛡️ 보안 정보

- **Webhook URL**: `.claude/hooks/.env`에만 저장, `.gitignore`에 등록되어 git에 커밋되지 않음
- **환경변수 등록 불필요**: Windows 사용자 환경변수 수동 등록이 필요 없음 (스크립트가 자동 로드)
- **소스 공개 안전**: 스크립트 로직과 Webhook URL이 완전히 분리되어, 리포지토리에 스크립트만 커밋 가능

## 📱 모바일 Slack 앱 설정

1. Slack 앱에서 `#ai-claude` 채널을 즐겨찾기에 추가
2. 채널 설정 → 알림 설정 → "모든 메시지" 또는 "@mention" 선택
3. 모바일 기기 설정 → 푸시 알림 활성화

→ 이제 터미널이 없어도 Slack 모바일로 권한/완료 알림을 받을 수 있습니다!

## 📚 참고 자료

- **Claude Code Hooks 공식 문서**: 설정 파일 스키마, 이벤트 목록, 고급 기능
- **Slack Incoming Webhook API**: 커스터마이징 방법 (색상, 리치 포맷, 첨부파일 등)
- **프로젝트 설정**: `.claude/CLAUDE.md` → Next.js 16 가이드 및 아키텍처

## ❓ FAQ

**Q: 훅 스크립트를 수정하고 싶어요**
A: `.claude/hooks/notify-slack.sh`를 직접 편집하면 됩니다. 다음 Claude Code 세션부터 반영됩니다.

**Q: 다른 Slack 채널로 보내고 싶어요**
A: `.claude/hooks/notify-slack.sh` 73번 줄의 `"channel":"#ai-claude"` 부분을 수정하세요. (또는 다른 webhook을 생성해 `.env`에 다시 등록)

**Q: 알림을 일시 비활성화하고 싶어요**
A: `.claude/settings.local.json`의 `hooks` 섹션을 주석 처리하거나 전체 삭제하면 됩니다. (`.gitignore` 대상이라 커밋에 영향 없음)

**Q: 스크립트 재사용할 수 있나요?**
A: 네! `.claude/hooks/notify-slack.sh` + `.claude/hooks/.env`을 다른 프로젝트에 복사하고 `.env`의 URL만 수정하면 됩니다.
