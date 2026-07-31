# 프로젝트 설정 파일 커밋 (의미 단위 분리)

## Context

이전 세션에서 Playwright MCP를 이용해 애플리케이션 오류를 조사했고, 결과적으로 실제 소스 코드 변경(diff)은 없었습니다. 다만 그 과정에서 프로젝트 루트에 다음 4종류의 untracked 파일/디렉토리가 생성되었습니다.

- `.claude/` — Claude Code 설정: `settings.json`(프로젝트 공용 권한 및 MCP 서버 활성화), `settings.local.json`(개인용 권한 오버라이드), `plans/`(플랜 문서)
- `.mcp.json` — Playwright MCP 서버 실행 설정 (팀 공용)
- `.vscode/settings.json` — 에디터 설정 (CSS lint 규칙)
- `.playwright-mcp/` — 이번 조사 세션에서 생성된 브라우저 스냅샷(.yml)/콘솔 로그(.log) — 일회성 디버깅 산출물

사용자는 다음과 같이 처리 방향을 확정했습니다.
1. `.playwright-mcp/`는 일회성 산출물이므로 `.gitignore`에 추가하고 커밋에서 제외
2. `.claude/`, `.mcp.json`, `.vscode/`는 팀과 공유할 가치가 있는 설정이므로 커밋 — 단 `.claude/settings.local.json`은 이름 그대로 개인용 로컬 오버라이드이므로 `.gitignore` 처리

이 작업의 목적은 "의미 있는 단위로 나눠서 커밋"하는 것이므로, 성격이 다른 설정들을 하나의 커밋에 묶지 않고 논리적 단위로 분리합니다.

## 커밋 단위 계획

### 커밋 1: `.gitignore`에 로컬/산출물 항목 추가
- `D:\claude\claude-nextjs-staterkit\.gitignore` 수정
  - `.playwright-mcp/` 추가 (Playwright MCP 브라우저 세션 산출물)
  - `.claude/settings.local.json` 추가 (개인용 권한 오버라이드)
- 커밋 메시지 예: `chore: Playwright MCP 산출물 및 개인 설정 gitignore 처리`

### 커밋 2: Claude Code 프로젝트 설정 추가
- `git add .claude/settings.json .claude/plans/`
- `.claude/settings.local.json`은 1번 커밋에서 이미 gitignore 처리되어 자동 제외됨
- 내용: 프로젝트 공용 권한(WebSearch, Bash, WebFetch, mcp__playwright)과 MCP 서버 활성화 설정, 플랜 문서
- 커밋 메시지 예: `chore: Claude Code 프로젝트 설정 추가`

### 커밋 3: MCP 서버 설정 추가
- `git add .mcp.json`
- 내용: Playwright MCP 서버(`@playwright/mcp`) stdio 실행 설정
- 커밋 메시지 예: `chore: Playwright MCP 서버 설정 추가`

### 커밋 4: VSCode 에디터 설정 추가
- `git add .vscode/settings.json`
- 내용: `css.lint.unknownAtRules: ignore` (Tailwind CSS v4의 `@theme`, `@apply` 등 커스텀 at-rule에 대한 VSCode CSS lint 경고 방지)
- 커밋 메시지 예: `chore: Tailwind CSS at-rule 경고 방지용 VSCode 설정 추가`

## 실행 절차
1. `.gitignore`에 두 줄 추가 (Edit 도구)
2. 위 4개 커밋을 순서대로 `git add <해당 파일/디렉토리>` → `git commit -m "..."` 로 생성
3. 각 커밋 후 `git status`로 남은 untracked 파일이 의도한 대로 줄어드는지 확인
4. 마지막에 `git log --oneline -6`과 `git status`로 최종 상태 검증 (untracked에 `.playwright-mcp/`, `.claude/settings.local.json`만 gitignore되어 사라졌는지, working tree clean 여부)

## 검증 방법
- 각 커밋 후 `git show --stat <커밋>`으로 의도한 파일만 포함됐는지 확인
- 최종 `git status`가 clean(추적 안 되는 실질 항목 없음) 상태인지 확인
- `.env*`, 자격 증명 등 민감 정보가 포함되지 않았는지 커밋 전 내용 재확인 (이미 위에서 각 파일 내용 확인 완료 — 민감 정보 없음)
