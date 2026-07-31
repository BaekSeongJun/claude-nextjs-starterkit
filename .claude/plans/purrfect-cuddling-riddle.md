# `/code-review:staff` 커스텀 커맨드 작성 계획

## Context
사용자가 Gemini로 초안 작성한 "Staff Software Engineer 코드 리뷰" 프롬프트를 이 저장소 전용 커스텀 슬래시 커맨드로 정착시키고 싶어합니다. 원본은 범용 백엔드/풀스택 프로젝트를 가정한 리뷰 기준(메모리 누수, DB 쿼리, SOLID 원칙 등)을 담고 있는데, 이 저장소는 DB/백엔드 API가 없는 Next.js 16 App Router 순수 프론트엔드 스타터킷이므로 그대로 쓰면 해당 없는 항목이 섞입니다.

앞서 같은 방식으로 `/deploy:preflight` 커맨드(`.claude/commands/deploy/preflight.md`)를 만든 전례가 있고, 그때와 동일하게 "프로젝트 실체에 맞게 항목을 재구성 + 자동 검증 가능한 부분은 실행"하는 접근을 이어갑니다.

사용자 답변으로 확정된 사항:
- **파일 수정 권한**: 리뷰 직후 무단 수정은 하지 않되, 리뷰 후 "적용할까요?"라고 사용자에게 물어보고 승인 시 Edit 실행 (`allowed-tools`에 `Edit` 포함)
- **리뷰 범위($ARGUMENTS)**: 비어있으면 `git diff HEAD`(unstaged+staged 전체) 대상. 특정 파일명/디렉토리를 주면 그 범위만 필터링

## 프로젝트 컨텍스트 (원본 프롬프트 대비 조정 근거)
- DB 없음 → "DB 쿼리 최적화" 항목은 N/A 처리, 대신 zod 스키마/react-hook-form 관련 항목으로 대체
- 백엔드 API 라우트 없음 → "injection(SQL 등)" 항목은 N/A, 대신 클라이언트 사이드 검증 우회 가능성·`NEXT_PUBLIC_` 환경변수 노출 위주로 재구성
- 이 저장소는 CLAUDE.md에 **4-레이어 컴포넌트 구조(L1 ui/ → L2 forms/ → L3 layout/ → L4 page)**가 명시되어 있음 → 원본에 없는, 이 프로젝트만의 고유 리뷰 기준으로 추가해야 함:
  - `components/ui/`(L1, shadcn 생성) 직접 수정 여부 (금지 규칙 위반 체크)
  - L2가 `components/ui/field.tsx` 기반 패턴을 따르는지 (shadcn 표준 `form.tsx` 아님)
  - Next.js 16 breaking change: `params`/`searchParams` 동기 접근 여부 (반드시 Promise, `await`/`use()`)
  - `nav-items.ts` 단일 소스 원칙 위반(내비게이션 항목을 다른 곳에 하드코딩) 여부
- "불필요한 리렌더링", "SOLID/가독성/네이밍" 등은 React 19 함수형 컴포넌트 기준으로 재해석해서 유지 (예: SOLID 대신 "단일 책임 컴포넌트/훅 분리" 식으로 이 프로젝트 어휘에 맞춤)
- "Refactored Code" 섹션은 유지하되, 실제 파일 수정은 사용자 승인 후에만 별도 Edit 단계로 분리

## 새 파일: `.claude/commands/code-review/staff.md`

기존 `.claude/commands/git/commit.md`, `.claude/commands/deploy/preflight.md`와 동일한 frontmatter 컨벤션(`description`, `allowed-tools`) 사용.

```yaml
---
description: "Staff 엔지니어 관점의 엄격하고 건설적인 코드 리뷰를 수행합니다"
allowed-tools:
  ["Read", "Grep", "Glob", "Edit", "Bash(git diff:*)", "Bash(git log:*)", "Bash(git status:*)"]
---
```

### 본문 구성
1. **입력 파라미터**: `$ARGUMENTS` — 비어있으면 `git diff HEAD` 전체, 파일/디렉토리명이 오면 해당 범위로 필터링해 `git diff HEAD -- <경로>` 사용
2. **프로세스**:
   1. 리뷰 대상 diff 확보 (`git diff HEAD` 또는 범위 지정 시 필터링)
   2. 변경된 각 파일을 Read로 전체 컨텍스트 파악 (diff 조각만으로 판단 금지 — 특히 L1/L2/L3/L4 레이어 규칙 위반은 파일 전체를 봐야 판단 가능)
   3. 아래 리뷰 기준(원본 4개 카테고리 + 프로젝트 고유 기준)을 순서대로 점검
   4. 발견 사항을 심각도별로 분류해 출력 포맷에 맞게 정리
   5. 마지막에 "제안된 개선사항을 지금 적용할까요?"를 물어보고, 사용자가 승인한 항목만 Edit으로 반영
3. **리뷰 기준** (원본 4개 유지 + 조정):
   - Bug & Edge Cases (원본 그대로 — 이 프로젝트에도 100% 해당)
   - Performance & Re-render (원본의 "메모리 누수/DB 쿼리"를 "불필요한 리렌더링, useEffect 의존성 배열, 큰 리스트 key 처리"로 좁힘 — DB 없으므로)
   - Security & Data Handling (원본의 "injection"을 "클라이언트 검증 우회 가능성, `NEXT_PUBLIC_` 환경변수 오남용, zod 스키마 누락"으로 재정의)
   - Readability & Architecture (원본 유지 + 이 저장소 고유 규칙: 4-레이어 구조 준수, `components/ui/` 직접 수정 금지, `nav-items.ts` 단일 소스 원칙)
4. **출력 포맷**: 원본의 4개 섹션(🎯 Executive Summary / 🚨 Critical Issues / 💡 Suggestions / ✨ Refactored Code)을 그대로 유지하되, Refactored Code는 "코드 블록 제안"이고 실제 파일 반영은 별도 승인 단계임을 명시
5. **참고사항**: 이 커맨드는 리뷰와 승인된 수정만 수행하며 커밋/푸시는 하지 않음(그건 `/git:commit` 몫)

## 검증 방법
- 파일 작성 후 `/code-review:staff`를 인자 없이 실행해, 현재 저장소의 모든 변경사항(git diff HEAD 기준: unstaged + staged)을 대상으로 리뷰가 정상 동작하는지 확인
- 특정 파일 지정(`/code-review:staff components/forms/login-form.tsx`)으로도 한번 실행해 범위 필터링이 의도대로 동작하는지 확인
