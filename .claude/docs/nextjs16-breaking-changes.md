# Next.js 16 브레이킹 체인지

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

이 프로젝트는 **Next.js 16.2.12**를 사용하며, 기존 버전 13~15와 비교하면 매우 큰 브레이킹 체인지가 있습니다. 코드를 작성하기 전에 이 섹션을 꼼꼼히 읽고, 필요한 경우 Next.js 공식 문서를 참고하세요.

## 문서 참고

`node_modules/next/dist/docs/` 폴더의 Next.js 문서를 읽어보세요. 특히 다음을 확인하시기 바랍니다:
- `01-app/01-getting-started/03-layouts-and-pages.md` (라우팅의 핵심 개념)
- `01-app/01-getting-started/04-linking-and-navigating.md` (Link 컴포넌트, params, searchParams)
- `01-app/03-api-reference/04-functions/use-params.md` (Next.js v16에서 params가 Promise로 작동하는 방식)

## 주요 v16 브레이킹 체인지

### 1. **`params`와 `searchParams`는 항상 Promise**

Next.js 16에서는 `params`와 `searchParams`를 더 이상 동기로 접근할 수 없습니다. 서버 컴포넌트에서는 `await`로 기다려야 하고, 클라이언트 컴포넌트에서는 React의 `use()` 훅으로 감싸야 합니다.

- ❌ **잘못된 방식 (동기 접근):** `<ServerComponent>{params.id}</ServerComponent>` 
  - 에러: `Type Error: Cannot read property 'id' of Promise`
  - 빌드 시점에 에러가 발생합니다.

- ✅ **올바른 방식 (서버 컴포넌트):** `{await params.id}`
  - 비동기 서버 컴포넌트(Next.js 페이지의 기본값) 안에서 params를 접근할 때 사용합니다.

- ✅ **올바른 방식 (클라이언트 컴포넌트):** `{use(params).id}`
  - React에서 `use` 임포트: `import { use } from 'react'`
  - `'use client'` 지시어가 붙은 컴포넌트 안에서 params를 필요로 할 때 사용합니다.

**영향:** 동적 라우트(`[slug]`)와 params를 읽는 페이지는 **반드시** `await` 또는 `use()`를 사용해야 합니다. 동기 접근(v15 호환성 모드)은 완전히 제거되었습니다. 컴파일러가 빌드 시점에 이를 감지합니다.

### 2. **`middleware.ts` → `proxy.ts`로 변경**

- 엣지 런타임(Edge Runtime)이 더 이상 같은 방식으로 지원되지 않습니다.
- 엣지 미들웨어 기능은 이제 `proxy.ts` (Node.js 런타임만 지원)를 사용해야 합니다.
- 엣지 런타임 기능이 필요하면 Next.js v16 공식 문서를 참고하세요.

### 3. **병렬 라우트 슬롯(`@slot`)에 `default.js` 필수**

- 이전까지는 병렬 라우트에서 `default.js`가 선택사항이었습니다.
- v16에서는 모든 슬롯이 **반드시** `default.js` 파일을 가져야 하며, 없으면 빌드 시점에 에러가 발생합니다.

### 4. **Turbopack이 기본 번들러**

- 커스텀 webpack 설정은 이제 `--webpack` 플래그를 사용해야 합니다.
- 대부분의 프로젝트는 이를 변경할 필요가 없습니다. Turbopack이 더 빠르고 대부분 호환됩니다.
- 커스텀 webpack 설정이 있다면 Next.js 문서를 읽고 마이그레이션해야 합니다.

## 데프리케이션 공지사항 준수

Next.js 공식 문서의 데프리케이션 공지사항을 주의 깊게 읽어야 합니다. v16에서 이미지, 인증, 설정 등의 패턴이 크게 변경되었습니다:

- **Image API:** `next/image`의 더 이상 지원되지 않는 props를 확인하세요.
- **인증 패턴:** 인증 라이브러리와 미들웨어 패턴이 변경되었을 수 있습니다.
- **설정:** `next.config.ts`에서 더 이상 지원되지 않거나 변경된 옵션을 확인하세요.

## 관련 리소스

- **AGENTS.md** — Next.js 전역 에이전트 지시사항 (자동 관리 파일).
- **CLAUDE.md** — 빠른 참고 자료 및 전체 문서 인덱스.

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
