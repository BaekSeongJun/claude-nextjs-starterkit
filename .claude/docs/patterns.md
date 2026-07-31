# 주요 구현 패턴

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

이 문서는 이 프로젝트에서 자주 사용되는 작업에 대한 권장 패턴을 설명합니다.

## 다크모드

### 라이브러리 & 설정
- **라이브러리:** `next-themes`
- **루트 설정:** `app/layout.tsx`에서 전체 앱을 `ThemeProvider`로 래핑
- **CSS:** `app/globals.css`의 Tailwind v4 `@custom-variant dark` (테마에 따라 `.dark` 클래스 설정)

### 구현
1. **래퍼:** `ThemeProvider` 컴포넌트 (`components/theme-provider.tsx`)
   - 전체 애플리케이션을 루트 레이아웃의 최상단에서 감쌉니다
   - 테마 지속성(localStorage)과 SSR 하이드레이션을 처리합니다
2. **루트 레이아웃** (`app/layout.tsx`):
   - 최상단에 `ThemeProvider`를 포함해야 합니다
   - 하이드레이션 불일치를 피하기 위해 `suppressHydrationWarning` 속성을 설정합니다
3. **토글 UI:** `ModeToggle` 컴포넌트 (`components/mode-toggle.tsx`)
   - `'use client'`로 마크됨 (`useTheme()` 훅 사용)
   - 일반적으로 헤더에 배치됩니다

### 페이지에 다크모드 추가
- 헤더/레이아웃 컴포넌트에 `ModeToggle`을 포함하세요
- 추가 설정이 필요하지 않습니다 — `ThemeProvider`가 나머지를 처리합니다
- CSS 변수가 Tailwind의 dark 변형을 통해 자동으로 적응합니다

## 폼 검증 (Zod + react-hook-form)

### 1단계: 스키마 정의 (`lib/validations/*.ts`)

```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('유효하지 않은 이메일'),
  password: z.string().min(8, '최소 8자 필요'),
})

export type LoginValues = z.infer<typeof loginSchema>
```

**모범 사례:** 스키마와 타입을 같은 파일에 보관하세요. `z.infer`를 사용해 TypeScript 타입을 스키마에서 파생시켜 둘이 절대 다르지 않도록 합니다.

### 2단계: 폼 컴포넌트 생성 (`components/forms/*.tsx`)

```ts
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/lib/validations/login'
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginValues) {
    // 백엔드 통합 로직을 여기에 추가합니다
    console.log(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Field>
        <FieldLabel htmlFor="email">이메일</FieldLabel>
        <FieldContent>
          <input {...form.register('email')} id="email" />
          {form.formState.errors.email && (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          )}
        </FieldContent>
      </Field>
      <Button type="submit">제출</Button>
    </form>
  )
}
```

**주요 포인트:**
- 스키마 + 파생된 타입 임포트
- `useForm()`을 `zodResolver(schema)`로 래핑
- `@/components/ui/field`의 `Field` + `FieldLabel` + `FieldContent` + `FieldError` 사용 (shadcn의 `form.tsx` 아님)
- 이 프로젝트는 더 나은 제어를 위해 커스텀 필드 API를 사용합니다

### 3단계: 백엔드 통합

현재 폼의 `onSubmit`은 스텁입니다. 다음 중 하나로 연결하세요:
1. API 라우트 생성 (`app/api/...`)
2. 서버 액션 생성
3. 외부 API 엔드포인트 호출

클라이언트 검증만 있습니다. 서버에서는 항상 재검증하세요.

## 네비게이션

### 단일 소스

모든 네비게이션 항목은 한 곳에 정의됩니다: **`components/layout/nav-items.ts`**

```ts
export const navItems = [
  { href: '/', label: '홈' },
  { href: '/login', label: '로그인' },
]
```

### 사용법

데스크톱과 모바일 네비 모두 같은 배열을 사용합니다:
- `main-nav.tsx` — 데스크톱 가로 메뉴
- `mobile-nav.tsx` — 모바일 슬라이드아웃 패널 (Sheet 기반)

**메뉴 항목 추가:**
1. `nav-items.ts`만 수정합니다
2. 데스크톱과 모바일 메뉴가 자동으로 업데이트됩니다
3. 컴포넌트에 메뉴 텍스트를 하드코딩하지 마세요 — 절대 금지입니다

## 라우팅

### 앱 라우터 (페이지 라우터 없음)

이 프로젝트는 Next.js 앱 라우터만 사용합니다. 페이지 라우터(`pages/` 디렉토리)는 없습니다.

### 라우트 그룹

`(demo)`처럼 라우트 그룹을 사용해 URL에 영향 없이 코드를 구성합니다:
- 폴더: `app/(demo)/login/page.tsx`
- URL: `/login` (`(demo)` 그룹이 URL에 나타나지 않음)
- 레이아웃 범위 지정과 관련 라우트 구성에 유용합니다

### 동적 라우트와 params

동적 라우트를 추가할 때 (예: `[slug]`), **v16에서 params는 Promise**임을 기억하세요:

```ts
// ✅ 올바른 방식 (서버 컴포넌트)
export default async function Page({ params }) {
  const { slug } = await params  // 반드시 await!
  return <div>{slug}</div>
}
```

```ts
// ✅ 올바른 방식 (클라이언트 컴포넌트)
'use client'
import { use } from 'react'

export default function Page({ params }) {
  const { slug } = use(params)  // 반드시 use()!
  return <div>{slug}</div>
}
```

자세한 내용은 [Next.js 16 브레이킹 체인지](./nextjs16-breaking-changes.md)를 참고하세요.

### 현재 설정

동적 라우트는 아직 설정되지 않았고 모든 페이지는 정적입니다. 추가할 때는 위의 패턴을 즉시 적용하세요.

## 스타일링

### CSS 프레임워크
- **프레임워크:** Tailwind CSS v4 (CSS 우선 변형 방식)
- **Shadow DOM 컴포넌트:** shadcn/ui와 함께 기본 제공됨

### shadcn/ui 설정
- **설정 파일:** `components.json`
  - 스타일: `radix-nova`
  - 기본 색상: `neutral`
  - 경로 별칭: `@/components`, `@/lib`, `@/ui`, `@/hooks`

### 전역 스타일
- **파일:** `app/globals.css`
- **내용:** CSS 변수, 다크모드 변형 설정
- **Tailwind v4 다크모드:** `@custom-variant dark`를 사용해 `.dark` 클래스 설정 (`next-themes`가 제어)

### 새 컴포넌트 추가

shadcn CLI를 사용해 컴포넌트를 추가합니다:

```bash
npx shadcn add <name> -y
# 예: npx shadcn add table -y
```

이 명령은 컴포넌트를 `components/ui/`에 설치하고 설정을 생성합니다. 이 파일들을 수정하지 마세요. 커스터마이징이 필요하면 L2에서 래핑하세요.

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
