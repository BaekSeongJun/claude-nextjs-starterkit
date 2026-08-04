# CLAUDE.md

이 파일은 이 리포지토리의 코드를 다룰 때 Claude Code(claude.ai/code)에 제공하는 지침입니다.

## ⚠️ 중요: Next.js 16 브레이킹 체인지

이 프로젝트는 **Next.js 16.2.12**를 사용하며, 버전 13~15와 비교하면 매우 큰 브레이킹 체인지가 있습니다. **코드를 작성하기 전에 [Next.js 16 브레이킹 체인지 가이드](./.claude/docs/nextjs16-breaking-changes.md)를 읽어보세요.**

핵심 포인트: `params`와 `searchParams`는 **항상 Promise**입니다 — 서버 컴포넌트에서는 `await`, 클라이언트 컴포넌트에서는 `use()`를 사용해야 합니다. 동기 접근은 완전히 제거되었습니다.

---

## 빠른 시작

개발, 빌드, 린트 등 자주 사용하는 명령어는 [commands.md](./.claude/docs/commands.md)를 참고하세요.

**주의:** 이 프로젝트에는 테스트 러너가 설정되지 않았습니다. 필요하면 Jest/Vitest를 추가하세요.

---

## 문서 목차

프로젝트 지침이 다음의 집중된 모듈로 구성되어 있습니다:

1. **[Next.js 16 브레이킹 체인지](./.claude/docs/nextjs16-breaking-changes.md)**  
   *중요 API 변경사항: `params`/`searchParams` Promise 처리, `middleware.ts` → `proxy.ts`, 등*

2. **[아키텍처: 계층화된 컴포넌트 구조](./.claude/docs/architecture.md)**  
   *4계층 컴포넌트 계층 구조(L1~L4), 디렉토리 구조, 유틸리티/검증 계층*

3. **[주요 구현 패턴](./.claude/docs/patterns.md)**  
   *다크모드, 폼 검증(zod + react-hook-form), 네비게이션, 라우팅, 스타일링*

4. **[서브에이전트 워크플로](./.claude/docs/subagent-workflows.md)**  
   *code-reviewer, debugger, test-runner 에이전트를 언제/어떻게 사용할지*

5. **[자주 사용하는 명령어 & 운영](./.claude/docs/commands.md)**  
   *개발 워크플로, 중요한 주의사항(L1 금지, 폼 백엔드 스텁, 테스트 없음), 트러블슈팅*

6. **[코드 리뷰 기준](./.claude/docs/review-criteria.md)**  
   *Bug/Performance/Security/Architecture 4대 리뷰 기준, 4-레이어 아키텍처 준수 체크*

7. **[Slack 모바일 알림 설정](./.claude/docs/slack-notification-setup.md)**  
   *권한 요청/작업 완료 시 Slack 모바일 알림 훅 설정 가이드*

---

## 참고 자료

- **README.md** — 전체 기능 개요, shadcn 컴포넌트 라이브러리 참고, 배포 가이드
- **AGENTS.md** — AI용 전역 지시사항 (자동 관리 파일)

### 서브에이전트 (읽기 전용 진단 에이전트)
- **.claude/agents/code-reviewer.md** — 읽기 전용 코드 리뷰 서브에이전트 정의; 아키텍처, 보안, 성능을 Staff Engineer 관점에서 검토. 리뷰 기준은 [코드 리뷰 기준](./.claude/docs/review-criteria.md) 참고
- **.claude/agents/debugger.md** — 근본 원인 분석(RCA) 서브에이전트; 버그를 출처까지 추적하며 Next.js 16에 특화
- **.claude/agents/test-runner.md** — QA & 테스트 진단 서브에이전트; Production Bug vs Test Setup Issue 분류

### 커스텀 슬래시 커맨드 (상호작용형 워크플로)
- **.claude/commands/code-review/staff.md** — `/code-review:staff` 커맨드; git diff 기반 코드 리뷰 + 승인 시 자동 수정 (상세 동작은 `.claude/docs/commands.md` 참고)
- **.claude/commands/git/commit.md** — `/commit` 커맨드; 이모지 + 컨벤셔널 포맷 커밋 생성
- **.claude/commands/deploy/preflight.md** — `/deploy:preflight` 커맨드; 배포 전 자동 검증 + 수동 확인 체크리스트 (프로젝트 실제 구성 반영)

### 기타
- **next.config.ts** — Next.js 설정 (현재 최소 설정; 필요하면 커스텀 webpack/Turbopack 설정 추가)
