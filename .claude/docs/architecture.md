# 아키텍처: 계층화된 컴포넌트 구조

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

코드베이스는 **4계층 컴포넌트 계층 구조** + **유틸리티/검증** 계층을 따릅니다. 이 구조는 새로운 파일을 어디에 둘지를 결정합니다.

## 계층 개요

### L1: 프리미티브 컴포넌트 (`components/ui/`)

- **출처:** `shadcn add` CLI로 생성됨 — shadcn/ui 레지스트리에서 그대로 설치됨
- **규칙:** 직접 수정하지 마세요. CLI 업데이트가 덮어씌웁니다. 커스터마이징이 필요하면 L2에서 래퍼를 만드세요.
- **예시:** `button.tsx`, `input.tsx`, `card.tsx`, `field.tsx` (커스텀 폼 필드 API)
- **중요 세부 사항:** 이 프로젝트는 shadcn의 표준 `form.tsx` 대신 `field.tsx` (Field, FieldContent, FieldError, FieldLabel)를 사용합니다 — L2 섹션을 참고하세요.

**핵심 규칙:** `components/ui/` 폴더의 파일은 절대 직접 수정하지 마세요. 커스터마이징이 필요하면 L2에서 래퍼 컴포넌트를 만드세요.

### L2: 컴포지트 컴포넌트 (`components/forms/`, `components/mode-toggle.tsx`)

- **목적:** 2개 이상의 L1 프리미티브를 도메인 로직과 조합
- **책임:** 폼 검증 (react-hook-form + zod), 테마 토글 상태
- **예시:** `components/forms/login-form.tsx`
  - `@/lib/validations/login` (zod 스키마) 임포트
  - 필드 레이아웃을 위해 `@/components/ui/field` (form.tsx 아님) 사용
  - `react-hook-form`으로 상태 래핑
  - `onSubmit` 핸들러 호출 (백엔드 통합은 스텁)

**범위:** L1 프리미티브의 모양이나 동작을 도메인에 맞게 커스터마이징해야 하면 여기에서 하세요. L1을 직접 수정하지 마세요.

### L3: 레이아웃 컴포넌트 (`components/layout/`)

- **목적:** 반복되는 페이지 셸 (헤더, 풋터, 네비게이션)
- **파일:**
  - `site-header.tsx` — 상단 바 (로고, 네비게이션 메뉴, 테마 토글)
  - `site-footer.tsx` — 하단 바
  - `main-nav.tsx` — 데스크톱 가로 메뉴
  - `mobile-nav.tsx` — 모바일 슬라이드아웃 패널 (Sheet 기반)
  - `nav-items.ts` — 모든 메뉴 항목의 단일 소스 (여기서만 추가/수정)
- **데이터 흐름:** `main-nav`와 `mobile-nav` 모두 같은 `navItems` 배열을 사용 → 한 번의 수정으로 데스크톱 + 모바일 동시 업데이트

**핵심 규칙:** `nav-items.ts`가 네비게이션 구조를 정의하는 유일한 장소입니다. `site-header.tsx`, `main-nav.tsx`, `mobile-nav.tsx`에 메뉴 항목을 하드코딩하지 마세요.

### L4: 페이지 컴포넌트 (`app/**/page.tsx`)

- **목적:** Next.js 라우트에 매핑, L3 레이아웃 + 커스텀 콘텐츠 조합
- **현재 라우트:**
  - `/` → `app/page.tsx` (홈/소개)
  - `/login` → `app/(demo)/login/page.tsx` (데모 폼)
- **라우트 그룹:** `(demo)` 폴더는 URL에 나타나지 않음 (URL은 `/demo/login`이 아니라 `/login`)

**범위:** 페이지는 L3 레이아웃과 커스텀 콘텐츠를 조립합니다. 비즈니스 로직(폼, 검증)은 L2에 남고, 재사용 가능한 UI는 L1에 남습니다.

### 유틸리티 & 검증 (`lib/`, `lib/validations/`)

- `lib/utils.ts` — 클래스명 병합을 위한 `cn()`
- `lib/validations/login.ts` — zod 스키마 (예: `loginSchema`)
- **사용법:** L2 컴포지트 컴포넌트에서 임포트하고 사용합니다.

**설계:** 검증 스키마는 컴포넌트와 분리되어 여러 폼, 테스트, 백엔드 통합에서 재사용할 수 있습니다.

## 이 구조가 필요한 이유

이 계층화 방식은 관심사를 명확히 분리합니다:

1. **L1 (프리미티브)**은 안정적이고 CLI가 관리 — 수정하지 않습니다.
2. **L2 (컴포지트)**는 폼 로직, 검증, 도메인별 스타일이 들어갑니다.
3. **L3 (레이아웃)**은 공유되는 페이지 구조(헤더, 네비, 풋터)를 관리합니다.
4. **L4 (페이지)**는 라우트를 매핑하는 접착제 역할 — 최소한의 로직.
5. **유틸리티**는 재사용 가능하고 테스트 가능한 함수와 스키마입니다.

이렇게 하면 코드베이스를 쉽게 탐색, 테스트, 유지보수할 수 있습니다.

## 관련 패턴

자세한 구현 패턴(다크모드, 폼 검증, 라우팅)은 [패턴](./patterns.md)을 참고하세요.

이 아키텍처를 강제하는 코드 리뷰 기준은 [서브에이전트 워크플로](./subagent-workflows.md)를 참고하세요.

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
