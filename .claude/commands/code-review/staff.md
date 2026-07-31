---
description: "Staff 엔지니어 관점의 엄격하고 건설적인 코드 리뷰를 수행합니다"
allowed-tools:
  [
    "Read",
    "Grep",
    "Glob",
    "Edit",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Bash(git status:*)",
  ]
---

# Claude 명령어: Code Review (Staff)

Staff 엔지니어 관점의 엄격하고 건설적인 코드 리뷰를 수행합니다.

## 입력 파라미터

`$ARGUMENTS` — 리뷰 범위 지정. 비어 있으면 전체 변경사항을 대상으로 합니다.

- **비어 있음** (또는 `-`) → `git diff HEAD` 전체 실행 (unstaged + staged)
  - 예: `/code-review:staff` (모든 변경사항 리뷰)
- **특정 파일** → 해당 파일만 리뷰
  - 예: `/code-review:staff login-form.tsx`
- **디렉토리** → 해당 디렉토리 내 변경사항만 리뷰
  - 예: `/code-review:staff components/forms`

## 프로세스

1. `git status` / `git diff HEAD`로 리뷰 대상 파일 확보
   - `$ARGUMENTS` 없음 → 전체 diff
   - `$ARGUMENTS` 있음 → `git diff HEAD -- <경로>` 필터링으로 해당 범위만 추출
2. 변경된 각 파일을 **전체 컨텍스트**로 Read (diff 조각만으로는 불완전한 판단 방지)
3. 아래 리뷰 기준을 순서대로 적용
4. 발견 사항을 심각도별로(🚨 Critical / 💡 Suggestion)로 분류해 출력 포맷 생성
5. 마지막에 "제안된 개선사항을 적용할까요?"를 물어보고, 사용자 승인 시 Edit으로 반영

## 리뷰 기준

### 1. Bug & Edge Cases (치명적 문제)
- null/undefined 검사 누락 — 예: `user?.name` vs `user.name` (runtime 에러 위험)
- React 16 breaking change: `params`/`searchParams`는 항상 **Promise** — `await` 또는 `use()` 필수 (동기 접근 금지)
- zod 스키마 검증 누락 — 폼 필드가 `loginSchema` 등으로 정의되지 않은 경우
- 컴포넌트 구조 원칙 위반 (아래 "Readability & Architecture" 참조)

### 2. Performance & Optimizations
- 불필요한 리렌더링: 컴포넌트가 `'use client'`인데도 매 렌더링마다 새로운 함수/객체 생성 (클로저 캡처 실패)
- useEffect 의존성 배열 누락 또는 불완전 — 예: `useEffect(() => {...}, [])` vs `useEffect(() => {...}, [deps])` (무한 루프 위험)
- 큰 리스트 렌더링 시 `key` prop 누락 또는 인덱스 사용 (DOM 재조정 비효율)
- 큰 번들 임포트: 예를 들어 `import _ from 'lodash'` 대신 `import { debounce } from 'lodash'` (tree-shaking 고려)

### 3. Security & Data Handling
- 하드코딩된 시크릿 (API 키, 토큰) — `.env*`가 아닌 코드에 직접 포함
- `NEXT_PUBLIC_` 환경변수 오남용 — 브라우저에 노출되면 안 되는 민감 값(API 비밀키, 데이터베이스 URL 등)을 `NEXT_PUBLIC_` 접두사로 선언
- react-hook-form + zod 검증 우회 가능성 — `onSubmit` 핸들러가 Zod validation을 거치지 않고 사용자 입력을 직접 처리하거나, 폼 검증 결과를 무시하고 진행
- 사용자 입력 값을 바로 DOM에 렌더링 (XSS 위험) — React는 자동 escape하지만 `dangerouslySetInnerHTML` 사용 시 주의

### 4. Readability & Architecture

#### 4-1. 컴포넌트 레이어 구조 준수 (CLAUDE.md 정의)
이 프로젝트는 4-레이어 아키텍처를 따릅니다. 각 레이어의 책임 이탈을 체크:

- **L1: Primitives** (`components/ui/`) — shadcn/ui CLI로 생성된 저수준 컴포넌트 (Button, Input, Field 등)
  - ❌ 금지: 이 디렉토리 직접 수정. CLI 업데이트가 덮어씌움.
  - ✅ 권장: L2에서 래퍼 컴포넌트 만들어 커스터마이징
  - 예시 위반: `components/ui/field.tsx`를 폼 로직으로 확장 → L2 컴포넌트로 옮길 것

- **L2: Composites** (`components/forms/`, 단일 도메인 컴포넌트)
  - 책임: 2개 이상의 L1 컴포넌트 조합 + 도메인 로직 (react-hook-form, zod 검증)
  - 예: `LoginForm`는 Input + Button + Field 등을 조합하고 `loginSchema` 검증 처리
  - ❌ 위반: L2가 라우팅, 레이아웃 로직 처리하거나 L4(page)에만 쓸 특수 마크업 포함

- **L3: Layouts** (`components/layout/`) — 반복되는 페이지 구조 (Header, Footer, Nav)
  - 책임: 여러 페이지가 공유하는 UI 쉘
  - 특별 규칙: `nav-items.ts`가 **단일 소스** → `main-nav.tsx`와 `mobile-nav.tsx` 모두 이것을 import해야 함 (하드코딩 금지)
  - ❌ 위반: nav 항목을 `site-header.tsx`에 또 따로 정의

- **L4: Pages** (`app/**/page.tsx`) — Next.js 라우트, L3+L2 조합
  - 책임: 라우팅, params 처리 (`await params`), 페이지 조립
  - ❌ 위반: 폼 검증 로직(L2 책임) 또는 공유 nav(L3 책임) 재구현

#### 4-2. 코드 품질
- 네이밍: camelCase 변수/함수, PascalCase 컴포넌트 (TypeScript 컨벤션)
- 함수 길이: 단일 책임 원칙 — 너무 긴 컴포넌트는 하위 컴포넌트/커스텀 훅으로 분리
- 주석: 명시하지 않아도 코드 자체가 명확하면 주석 불필요. 왜냐는 상황에만 (숨은 제약, 차선책 이유 등)
- 타입 안전성: TypeScript를 활용하되, `any` 사용 자제. 필요하면 제네릭으로 정확히 선언

#### 4-3. Next.js 16 특화
- `params`/`searchParams`는 **Promise** (v16 breaking change)
  - ❌ `<ServerComponent> {params.id}` → 동기 접근 (컴파일 에러)
  - ✅ `<ServerComponent> {await params}.id` or `<ClientComponent> {use(params).id}`
- 동적 라우트(`[slug]`) 추가 시 `generateStaticParams()` 고려 (ISR/SSG 성능)
- `middleware.ts` 없음 → 엣지 런타임 기능이 필요하면 `proxy.ts` 사용 (문서 확인 필수)

## 출력 포맷

### 🎯 **Executive Summary**
Overall evaluation: **Pass** / **Needs Refactoring** / **Critical Issue**
- 한두 줄 요약: 이 변경사항의 전반적 건강도와 가장 중요한 문제점(있다면)

### 🚨 **Critical Issues** (배포 차단 수준)
형식: `<파일경로>:<줄번호>` — `<문제>` (with 영향도 설명 및 수정 방향)
- 이 섹션이 비었다면 "없음" 표시

### 💡 **Suggestions & Best Practices** (개선 권장사항)
형식: `<파일경로>:<줄번호>` — `<제안>` (현재 패턴 vs 권장 패턴)
- Non-blocking, 코드 정리/가독성 위주

### ✨ **Refactored Code** (제안된 수정 예시)
적용 가능한 개선사항을 코드 블록으로 제시 (Before/After 형식)
- 마지막에 "이 제안들을 지금 파일에 적용할까요?" 물어보기
- 사용자가 "네" 하면 Edit으로 실행, "아니오"면 보고서만 마무리

## 참고사항

- 이 커맨드는 리뷰와 승인된 수정만 수행하며, 커밋/푸시는 하지 않습니다 (`/git:commit` 담당)
- 변경된 파일이 없으면 "배포할 변경사항 없음" 보고
- 리뷰 범위를 잘못 지정했을 가능성이 있으면 먼저 확인 후 진행 (`git diff HEAD -- <경로>` 출력해보기)
