# 코드 리뷰 기준

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

이 문서는 Next.js 16 스타터킷의 코드를 검토할 때 적용하는 **공통 리뷰 기준**입니다. `/code-review:staff` 슬래시 커맨드와 code-reviewer 서브에이전트 모두 이 기준을 따릅니다.

---

## 1. Bug & Edge Cases (치명적 문제)

### null/undefined 검사
- ❌ `user.name` — runtime 에러 위험
- ✅ `user?.name` — optional chaining 또는 사전 검사

### Next.js 16 breaking change: `params`/`searchParams`는 항상 Promise
**Next.js 16에서 동기 접근은 완전히 제거됨**
- ❌ `<ServerComponent> {params.id}` — 동기 접근 (컴파일 에러)
- ✅ `<ServerComponent> {await params.id}` — 서버 컴포넌트에서 `await` 사용
- ✅ `<ClientComponent> {use(params).id}` — 클라이언트 컴포넌트에서 `use()` hook 사용

### zod 스키마 검증 누락
- 폼 필드가 `loginSchema` 등 zod 스키마로 정의되지 않은 경우
- 검증이 정의된 이후 자체 핸들러가 이를 우회하는 경우

### 컴포넌트 구조 원칙 위반
- L1~L4 4-레이어 계층 구조 위반 — [아키텍처](./architecture.md) 참고

---

## 2. Performance & Optimizations

### 불필요한 리렌더링
- 컴포넌트가 `'use client'`인데도 매 렌더링마다 새로운 함수/객체 생성 (클로저 캡처 실패)
- 예: `useCallback` 없이 핸들러를 JSX에서 인라인으로 정의

### useEffect 의존성 배열 누락 또는 불완전
- ❌ `useEffect(() => {...}, [])` — 필요한 의존성 누락 (무한 루프 위험)
- ✅ `useEffect(() => {...}, [deps])` — 사용하는 모든 외부 변수 포함

### 큰 리스트 렌더링 시 `key` prop
- ❌ `key={index}` — 아이템 순서 변경 시 DOM 재조정 비효율
- ✅ `key={item.id}` — 안정적인 고유 식별자 사용

### 큰 번들 임포트
- ❌ `import _ from 'lodash'` — 라이브러리 전체 포함
- ✅ `import { debounce } from 'lodash'` — tree-shaking 고려한 named import

---

## 3. Security & Data Handling

### 하드코딩된 시크릿
- API 키, 토큰, 데이터베이스 URL을 코드에 직접 포함하면 안 됨
- **반드시** `.env.local` 또는 `.env.production` 같은 환경 변수 파일 사용

### `NEXT_PUBLIC_` 환경변수 오남용
- `NEXT_PUBLIC_` 접두사는 브라우저에 노출됨
- ❌ `NEXT_PUBLIC_API_SECRET=xyz` — 민감한 값을 public으로 노출
- ✅ `API_SECRET=xyz` (접두사 없음) — 서버 사이드만 접근 가능

### react-hook-form + zod 검증 우회
- `onSubmit` 핸들러가 zod validation을 거치지 않고 직접 사용자 입력 처리
- 폼 검증 결과를 무시하고 진행하는 로직

### 사용자 입력을 바로 DOM에 렌더링 (XSS 위험)
- React는 기본적으로 자동 escape하지만, `dangerouslySetInnerHTML` 사용 시 특히 주의
- 외부 API에서 받은 HTML을 바로 렌더링하지 말 것

---

## 4. Readability & Architecture

### 4-1. 컴포넌트 레이어 구조 준수

이 프로젝트는 4-레이어 아키텍처를 따릅니다. 각 레이어의 책임 이탈을 체크합니다. [아키텍처 상세 설명](./architecture.md)을 참고하세요.

#### L1: Primitives (`components/ui/`)
- **출처:** `shadcn add` CLI로 생성된 저수준 컴포넌트 (Button, Input, Field 등)
- ❌ 금지: 이 디렉토리 직접 수정. CLI 업데이트가 덮어씌웁니다.
- ✅ 권장: L2에서 래퍼 컴포넌트 만들어 커스터마이징
- 예시 위반: `components/ui/field.tsx`를 폼 로직으로 확장 → L2 컴포넌트로 옮길 것

#### L2: Composites (`components/forms/`, 단일 도메인 컴포넌트)
- **책임:** 2개 이상의 L1 컴포넌트 조합 + 도메인 로직 (react-hook-form, zod 검증)
- 예: `LoginForm`는 Input + Button + Field 등을 조합하고 `loginSchema` 검증 처리
- ❌ 위반: L2가 라우팅, 레이아웃 로직 처리하거나 L4(page)에만 쓸 특수 마크업 포함

#### L3: Layouts (`components/layout/`)
- **책임:** 반복되는 페이지 구조 (Header, Footer, Nav)
- **특별 규칙:** `nav-items.ts`가 **단일 소스** → `main-nav.tsx`와 `mobile-nav.tsx` 모두 이것을 import해야 함 (하드코딩 금지)
- ❌ 위반: nav 항목을 `site-header.tsx`에 또 따로 정의

#### L4: Pages (`app/**/page.tsx`)
- **책임:** 라우팅, params 처리 (`await params`), 페이지 조립
- ❌ 위반: 폼 검증 로직(L2 책임) 또는 공유 nav(L3 책임) 재구현

### 4-2. 코드 품질

#### 네이밍
- **변수/함수:** camelCase
- **컴포넌트:** PascalCase
- TypeScript 컨벤션을 따를 것

#### 함수 길이
- 단일 책임 원칙 준수
- 너무 긴 컴포넌트는 하위 컴포넌트/커스텀 훅으로 분리

#### 주석
- 명시하지 않아도 코드 자체가 명확하면 주석 불필요
- 왜냐는 상황에만 작성 (숨은 제약, 차선책 이유, 특수한 버그 우회 등)

#### 타입 안전성
- TypeScript를 활용할 것
- `any` 사용 자제
- 필요하면 제네릭으로 정확히 선언

### 4-3. Next.js 16 특화

#### `params`/`searchParams`는 Promise (v16 breaking change)
- 동적 라우트(`[slug]`) 추가 시 반드시 `await` 또는 `use()` 사용
- [nextjs16-breaking-changes.md](./nextjs16-breaking-changes.md) 문서 참고

#### 동적 라우트 성능
- 동적 라우트(`[slug]`) 추가 시 `generateStaticParams()` 고려 (ISR/SSG 성능 향상)

#### Edge runtime
- `middleware.ts` 없음 — 엣지 런타임 기능이 필요하면 `proxy.ts` 사용
- [nextjs16-breaking-changes.md](./nextjs16-breaking-changes.md) 확인 필수

---

## 관련 리소스

- **아키텍처 상세:** [architecture.md](./architecture.md)
- **Next.js 16 breaking change:** [nextjs16-breaking-changes.md](./nextjs16-breaking-changes.md)
- **구현 패턴:** [patterns.md](./patterns.md)
- **서브에이전트 워크플로:** [subagent-workflows.md](./subagent-workflows.md)

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
