---
description: "배포 전 자동 검증 + 수동 확인 체크리스트를 생성합니다"
allowed-tools:
  [
    "Bash(npm run build:*)",
    "Bash(npm run lint:*)",
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Grep",
    "Glob",
    "Read",
  ]
---

# Claude 명령어: Deploy Preflight

배포 직전에 실행하는 자동 검증 + 수동 확인 체크리스트입니다.

## 입력 파라미터

`$ARGUMENTS` — 배포 대상 범위 (예: "로그인 폼 수정", "전체 배포", 특정 브랜치명). 비어 있으면 `git diff`로 현재 변경사항 전체를 대상으로 판단합니다.

## 프로젝트 전제

이 체크리스트는 **이 저장소의 현재 실제 구성**을 기준으로 합니다. 항목을 추가/삭제하기 전에 아래 전제가 여전히 유효한지 먼저 확인하세요:

- Next.js 16 App Router, 순수 프론트엔드 (백엔드 API 라우트 없음)
- **DB 없음** — ORM/DB 클라이언트 미설치. `LoginForm.onSubmit()`은 스텁이며 실제 인증 로직 없음
- **테스트 러너 없음** (`package.json`에 `test` 스크립트 없음)
- 에러 트래킹(Sentry 등) 미설치
- CI/CD 워크플로(`.github/workflows`) 없음, Vercel 설정은 `.gitignore`의 `.vercel`만 존재 (배포는 Vercel CLI/대시보드 수동 연동으로 추정)

→ DB 마이그레이션, API 인증/CORS, Sentry 관련 항목은 **해당 기능이 실제로 추가된 경우에만** 활성화하세요. 그 전까지는 "N/A (미구현)"으로 표시하고 건너뜁니다.

## 프로세스

1. `git diff` / `git status`로 이번 배포에 포함되는 변경 파일 목록 파악 (`$ARGUMENTS`로 범위가 좁혀지면 관련 파일만)
2. 아래 카테고리별로 **자동 검증 가능한 항목은 직접 실행**하고 결과를 체크리스트에 반영 (`[x]` 통과, `[ ]` 실패/미확인, `[-]` 해당 없음)
3. 자동화 불가능한 항목(사람 판단 필요)은 `[ ]`로 남겨두고 확인 방법을 함께 제시
4. 최종 출력은 아래 **출력 포맷**을 그대로 따름

## 체크리스트 카테고리

### 1. 빌드 & 코드 품질 (자동 검증)
- [ ] `npm run lint` 통과 — 직접 실행해서 결과 반영
- [ ] `npm run build` 통과 — 직접 실행해서 결과 반영 (Turbopack 빌드 에러/경고 확인)
- [ ] 변경된 `.ts`/`.tsx` 파일에 `console.log` / `debugger` 잔존 여부 — Grep으로 확인
- [ ] `params`/`searchParams`를 동기적으로 접근하는 코드가 없는지 (Next.js 16에서는 반드시 Promise, `await`/`use()` 필요) — Grep으로 확인

### 2. 환경 변수 & 시크릿 (자동 검증 + 수동 확인)
- [ ] `.env*` 파일이 git에 커밋되지 않았는지 (`git status`, `.gitignore` 확인) — 자동
- [ ] 코드에 하드코딩된 API 키/토큰이 없는지 — Grep으로 `NEXT_PUBLIC_` 아닌 민감어(`key`, `secret`, `token`, `password`) 패턴 스캔
- [ ] `NEXT_PUBLIC_` 접두사가 붙은 환경변수 중 브라우저에 노출되면 안 되는 값이 섞여있지 않은지 — 수동 확인
- [-] CORS/서버 인증·인가 설정 — **N/A**: 현재 API 라우트 없음. API 라우트 추가 시 이 항목 활성화

### 3. 데이터 무결성 (조건부)
- [-] DB 마이그레이션 안전성/하위호환성 — **N/A**: DB 미연동
- [-] 신규 엔드포인트 인덱싱 최적화 — **N/A**: DB 미연동
- [ ] `LoginForm.onSubmit()` 등 스텁 핸들러가 실제 백엔드 연동 전 상태로 배포되는 게 의도된 것인지 확인 — 수동

### 4. 안정성 & 모니터링 (수동 확인 중심)
- [ ] 콘솔 에러 없이 주요 페이지(`/`, `/login`)가 렌더링되는지 — 로컬에서 `npm run build && npm run start` 후 수동 확인
- [-] 에러 트래킹(Sentry 등) / 구조화 로깅 — **N/A**: 미설치. 프로덕션 트래픽이 생기기 전 도입 여부 판단 필요
- [ ] 다크모드 토글(`next-themes`)이 hydration mismatch 없이 동작하는지 — 수동 확인

### 5. 성능 & 빌드 산출물 (자동 검증 + 수동 확인)
- [ ] `npm run build` 산출물의 번들 크기 이상 징후 (급격한 증가) — 빌드 로그의 route별 First Load JS 비교
- [ ] 사용하지 않는 shadcn 컴포넌트/의존성이 `package.json`에 남아있지 않은지 — 수동 확인
- [-] 캐싱 헤더/CDN invalidation — **N/A**: `next.config.ts`에 커스텀 설정 없음, Vercel 기본값 사용 중으로 추정

## 출력 포맷

- 📋 **체크리스트**: 카테고리별로 위 항목을 실행 결과와 함께 `[x]`/`[ ]`/`[-]`로 출력
- ⚠️ **하이 리스크 영역**: 이번 diff에서 실제로 리스크가 있다고 판단되는 파일/영역과 롤백 방법 (예: `git revert <commit>`)
- 🚀 **Go / No-Go**: lint/build 실패, 시크릿 노출 등 즉시 배포를 막아야 하는 항목이 있으면 명시적으로 **No-Go** 선언. 없으면 **Go**

## 참고사항

- 이 커맨드는 배포를 직접 실행하지 않습니다 (push/deploy 명령 없음). 검증 결과만 보고합니다.
- 프로젝트에 DB, API 라우트, 인증, Sentry 등이 실제로 추가되면 이 파일의 "N/A" 항목들을 그때 활성화하도록 갱신하세요.
