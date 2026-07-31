# 컨텍스트

"빠르게 웹 개발을 시작할 수 있는" 모던 스타터킷을 구축한다. 사용자는 단순 컴포넌트 나열이 아니라 (1) 범용 웹사이트 요소를 먼저 전체 나열하고, (2) 이 프로젝트에 맞는 계층 체계로 분류하고, (3) 우선순위 티어에 따라 실제로 shadcn 컴포넌트 설치와 레이아웃 개발까지 진행하고, (4) 유틸리티 기능은 검증된 라이브러리로 해결("바퀴 재발명 금지")할 것을 요구했다. 폼 검증(react-hook-form+zod+shadcn `form`)과 반응형 네비게이션(데스크톱 가로 메뉴 + 모바일 `sheet`)은 사용자 확인을 거쳐 이번 범위로 확정됐다.

## 재조사 없이 확정된 현재 상태

- Next.js 16.2.12 App Router / TypeScript / Tailwind v4 / shadcn CLI 4.16.0(`radix-nova` 스타일) / lucide-react 설치 완료.
- 설치된 shadcn 관련 패키지: `class-variance-authority`, `clsx`, `radix-ui`, `tailwind-merge`, `tw-animate-css` 이들은 재설치하지 않는다.
- `components/ui/button.tsx`, `lib/utils.ts`(cn) 이미 존재. `data-slot`, `cva` 패턴을 따름 신규 UI 컴포넌트도 shadcn CLI로 설치해 이 패턴을 그대로 따르게 한다(수기 작성 금지).
- `app/globals.css`: `@import "shadcn/tailwind.css"`(Radix data-state variant 전역 주입, 유지 필수), `@custom-variant dark (&:is(.dark *));`가 이미 `next-themes`의 `attribute="class"` 동작과 정확히 맞물리도록 준비되어 있음. CSS 변수 기반 라이트/다크 팔레트 기완성.
- `components.json` aliases: `components`->`@/components`, `utils`->`@/lib/utils`, `ui`->`@/components/ui`, `lib`->`@/lib`, `hooks`->`@/hooks`.
- `app/layout.tsx`: Geist/Geist_Mono 폰트만 있고 ThemeProvider 없음, `lang="en"`, metadata가 CRA 기본값.
- `app/page.tsx`: Next.js 데모 페이지(교체 대상). `public/*.svg` 5종 데모 자산(정리 대상, 이번 계획에도 포함).
- shadcn 레지스트리 `ui` 카테고리 중 dry-run으로 실재 확인된 컴포넌트만 사용 가능: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, item, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip, kbd, native-select. 이 목록 밖의 이름을 지어내지 않는다.
- `sonner`는 `next-themes`에 의존함이 dry-run으로 확인됨 -> 다크모드 표준은 `next-themes`.
- `.env.example`은 이번 라운드에서도 생략(사용자 확정).

---

# Part 1. 범용 웹사이트 요소 전체 목록 (프로젝트 무관, 체계적 나열)

어떤 웹사이트라도 필요할 수 있는 요소를 기능 카테고리별로 정리한다. 이 목록 자체는 shadcn 레지스트리 존재 여부와 무관하게 "일반적으로 필요한 것"을 다 담는다. 괄호 안은 대응하는(존재할 경우) shadcn 컴포넌트명.

## 1.1 기본 UI 프리미티브 (Primitives)
버튼(`button`), 아이콘 버튼, 텍스트 인풋(`input`), 텍스트에어리어(`textarea`), 라벨(`label`), 체크박스(`checkbox`), 라디오 그룹(`radio-group`), 스위치/토글(`switch`, `toggle`, `toggle-group`), 셀렉트/네이티브 셀렉트(`select`, `native-select`), 콤보박스/자동완성(`combobox`), 슬라이더(`slider`), OTP 인풋(`input-otp`), 인풋 그룹(`input-group`), 배지(`badge`), 아바타(`avatar`), 구분선(`separator`), 카드 컨테이너(`card`), 스피너(`spinner`), 키보드 표시(`kbd`), 종횡비 박스(`aspect-ratio`).

## 1.2 피드백/상태 요소 (Feedback & State)
토스트 알림(`sonner`), 얼럿/인라인 경고(`alert`), 로딩 스켈레톤(`skeleton`), 진행률 바(`progress`), 빈 상태(empty state)(`empty`), 폼 필드 에러/헬프텍스트(`field`, `form`), 확인 다이얼로그(파괴적 액션 확인)(`alert-dialog`).

## 1.3 네비게이션 요소 (Navigation)
사이트 헤더, 푸터, 데스크톱 가로 메뉴/네비게이션 바(`navigation-menu`), 모바일 슬라이드 메뉴/드로어(`sheet`, `drawer`), 브레드크럼(`breadcrumb`), 탭(`tabs`), 페이지네이션(`pagination`), 사이드바 네비게이션(`sidebar`), 메뉴바(데스크톱 앱 스타일)(`menubar`), 커맨드 팔레트/전역 검색(`command`), 스크롤 영역(`scroll-area`).

## 1.4 데이터 표시 요소 (Data Display)
테이블(`table`), 차트(`chart`), 캐러셀/슬라이더(`carousel`), 아코디언(`accordion`), 콜랩서블(`collapsible`), 아이템 리스트(`item`), 리사이저블 패널(`resizable`), 아바타/배지(위와 중복 표기).

## 1.5 오버레이 요소 (Overlay)
모달 다이얼로그(`dialog`), 확인 다이얼로그(`alert-dialog`), 슬라이드 시트(`sheet`), 드로어(모바일 바텀시트류)(`drawer`), 드롭다운 메뉴(`dropdown-menu`), 팝오버(`popover`), 툴팁(`tooltip`), 호버 카드(`hover-card`), 컨텍스트 메뉴(우클릭)(`context-menu`).

## 1.6 폼 요소 (Forms)
텍스트/이메일/비밀번호 인풋, 텍스트에어리어, 셀렉트, 체크박스, 라디오, 스위치, 날짜 선택(`calendar`), 파일 업로드(프리미티브 없음, 필요시 직접 조합), 폼 검증 래퍼(`form` + react-hook-form + zod), 필드 레이아웃/에러 메시지(`field`).

## 1.7 레이아웃 셸 (Page Shell)
헤더(로고/네비/유틸리티 액션), 푸터(링크/저작권/소셜), 컨테이너(최대 너비 + 패딩 래퍼), 페이지 섹션 래퍼, 사이드바 레이아웃(문서/대시보드형), 그리드/컬럼 시스템(Tailwind 유틸리티로 충분, 별도 컴포넌트 불필요).

## 1.8 다크모드/테마
테마 프로바이더, 테마 토글 UI, CSS 변수 기반 컬러 토큰 시스템(이미 `globals.css`에 존재).

## 1.9 도메인 특화 요소 (선택적, 특정 서비스에서만 필요)
로그인/회원가입 폼, 검색창, 커맨드 팔레트(단축키 검색), 데이터 테이블(정렬/필터), 캐러셀(마케팅 배너), 차트(대시보드), 사이드바(문서/관리자 페이지), 페이지네이션(목록형 콘텐츠).

---

# Part 2. 계층 분류 체계 (이 프로젝트 전용 설계)

atomic design(atoms/molecules/organisms/templates)을 그대로 쓰지 않고, shadcn 기반 Next.js 프로젝트의 실제 폴더 구조와 1:1로 매핑되는 4계층을 정의한다.

| 계층 | 정의 | 특징 | 폴더 매핑 |
|---|---|---|---|
| L1. Primitive (기본 요소) | 더 이상 쪼갤 수 없는 단일 책임 UI 단위. 상태를 갖지 않거나 최소한의 로컬 상태만 가짐. shadcn CLI로 설치되는 그대로 사용, 커스터마이즈는 cva variant 조정 수준으로 제한. | 재사용 100%, 프로젝트 도메인 지식 없음 | `components/ui/` |
| L2. Composite (조합 패턴) | 2개 이상의 Primitive를 조합해 하나의 상호작용 패턴을 완성. 폼 필드 그룹, 커스텀 드롭다운 메뉴 구성, 네비게이션 메뉴 아이템 등. 프로젝트 도메인과 약하게 결합(예: 메뉴 항목 배열은 프로젝트마다 다름). | 재사용 가능하지만 이 프로젝트의 데이터 구조(메뉴 목록, 폼 스키마)에 맞춰 조립됨 | `components/forms/`, 메뉴 데이터 정의 파일 |
| L3. Layout (페이지 셸) | 페이지 전반에 걸쳐 반복되는 뼈대 구조. 헤더/푸터/네비게이션처럼 `app/layout.tsx`에서 한 번 조립되어 모든 페이지를 감싼다. Composite와 Primitive를 조합해 만들어짐. | 프로젝트당 보통 1세트만 존재, 상태(모바일 메뉴 열림 여부 등)를 가질 수 있음 | `components/layout/` |
| L4. Page (페이지 구현) | 실제 라우트에 대응하는 화면. Layout 안에 들어가는 콘텐츠. 도메인 로직(폼 제출, 데이터 페칭)이 여기 위치. | 라우트 1:1 대응, 재사용 대상 아님 | `app/**/page.tsx` |

추가로 다음 두 개의 지원 레이어를 명시한다(shadcn 생태계 관례를 따름):
- Providers 레이어: 전역 컨텍스트(테마 등)를 감싸는 클라이언트 컴포넌트. L1도 L4도 아니지만 `app/layout.tsx`에서 L3보다 바깥에서 감싼다. -> `components/theme-provider.tsx` (컴포넌트 루트 직속, `layout/`이 아닌 이유: 페이지 셸이 아니라 React 컨텍스트 공급자이기 때문).
- Validation/Utility 레이어: UI가 아닌 순수 로직(zod 스키마 등). -> `lib/validations/`.

Part 1의 요소를 이 표에 대입하면:
- L1(`components/ui/`): button, input, label, textarea, checkbox, radio-group, switch, select, badge, avatar, separator, card, sheet, dropdown-menu, dialog, alert-dialog, popover, tooltip, sonner(Toaster), form, field, navigation-menu(프리미티브 자체는 L1이나 실제 메뉴 데이터를 채우는 순간 L2가 됨).
- L2(`components/forms/`, 메뉴 데이터 정의): `login-form.tsx`(react-hook-form+zod+shadcn form 조합), `main-nav.tsx`/`mobile-nav.tsx`(navigation-menu/sheet + 메뉴 데이터 배열 조합).
- L3(`components/layout/`): `site-header.tsx`, `site-footer.tsx`.
- L4(`app/`): `app/page.tsx`(랜딩), `app/(demo)/login/page.tsx`(폼 데모).
- Providers(`components/`): `theme-provider.tsx`, `mode-toggle.tsx`(토글 버튼은 UI 조작 단위이므로 사실 L2에 가깝지만, 테마 컨텍스트와 강하게 결합되어 있어 provider 옆에 둔다).
- Utility(`lib/`): `lib/utils.ts`(기존), `lib/validations/login.ts`(신규).

---

# Part 3. 우선순위 티어와 실행 계획

## 1군 (필수, 이번 라운드에서 즉시 설치 + 구현)

목표: "빠른 시작"에 반드시 필요한 최소 뼈대. 다크모드, 페이지 셸(헤더+데스크톱/모바일 네비+푸터), 핵심 프리미티브.

설치 명령(신규 shadcn 컴포넌트):
```
npx shadcn add card badge separator dropdown-menu sonner input label sheet navigation-menu -y
```
- `sheet`: 모바일 햄버거 메뉴의 슬라이드 패널.
- `navigation-menu`: 데스크톱 가로 메뉴(hover/focus 기반 드롭다운도 지원하지만 여기서는 단순 링크 목록으로 사용).
- `dropdown-menu`: `ModeToggle`(라이트/다크/시스템 선택)에 사용.
- `sonner`: 폼 제출 성공 토스트(2군에서 사용하지만 다크모드와 함께 설치해 `next-themes` 의존성을 한 번에 해결).
- `card`, `badge`, `separator`, `input`, `label`: 랜딩 페이지 및 기본 폼 프리미티브.

신규 npm 패키지 (shadcn CLI가 `sonner` 설치 시 자동으로 `next-themes`를 추가하지 않을 수 있으므로 명시적으로 확인 후 필요시 별도 설치):
```
npm install next-themes
```
(설치 후 package.json에 이미 존재하는지 먼저 확인하는 검증 스텝을 포함한다.)

파일 작업(1군):
1. `components/theme-provider.tsx` (신규)
2. `components/mode-toggle.tsx` (신규)
3. `components/layout/main-nav.tsx` (신규, 데스크톱 네비게이션)
4. `components/layout/mobile-nav.tsx` (신규, Sheet 기반 모바일 네비게이션)
5. `components/layout/site-header.tsx` (신규, 로고+MainNav+MobileNav+ModeToggle 조합)
6. `components/layout/site-footer.tsx` (신규)
7. `app/layout.tsx` (수정: ThemeProvider, SiteHeader/SiteFooter, Toaster, metadata, lang="ko")
8. `app/page.tsx` (전면 교체: 스타터킷 소개 랜딩페이지)
9. `public/*.svg` 5종 삭제 (더 이상 참조 안 됨)

## 2군 (권장, 이번 라운드에서 함께 구현, 실용성 높음)

목표: 대부분의 실제 프로젝트가 곧 필요로 하는 폼 검증 패턴을 데모로 확립.

설치 명령:
```
npx shadcn add form field -y
```
신규 npm 패키지:
```
npm install react-hook-form zod @hookform/resolvers
```

파일 작업(2군):
1. `lib/validations/login.ts` (신규, zod 스키마)
2. `components/forms/login-form.tsx` (신규, react-hook-form + zod + shadcn form 조합)
3. `app/(demo)/login/page.tsx` (신규, 데모 페이지)
4. `app/page.tsx`에 "로그인 폼 데모 보기" 링크 추가(1군 랜딩페이지 작성 시 포함)

중요 검증 단계: `npx shadcn add form field -y` 실행 직후 `components/ui/form.tsx`, `components/ui/field.tsx` 파일을 열어 실제 export(`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` 등 예상되는 이름이 실제로 일치하는지, `field.tsx`와 어떤 관계인지)를 확인한 뒤 `login-form.tsx`의 import를 그에 맞춘다. 파일명이 예상과 다르면 실제 파일명을 기준으로 계획을 조정한다.

## 3군 (선택, 이번 라운드 보류, 향후 확장 지점만 문서화)

설치하지 않지만 README 또는 계획 문서에 "향후 필요 시 이렇게 추가" 형태로 남긴다:
- `table`: 목록/대시보드 화면 필요 시 (`npx shadcn add table`), TanStack Table과 조합 권장.
- `command`: Cmd+K 검색/커맨드 팔레트 필요 시.
- `carousel`: 마케팅 배너/캐러셀 필요 시 (Embla 기반).
- `chart`: 대시보드 통계 시각화 필요 시 (Recharts 기반).
- `calendar`, `combobox`: 날짜 선택, 자동완성 검색 필요 시.
- `tabs`, `accordion`, `breadcrumb`, `pagination`: 콘텐츠 많은 페이지/문서 사이트로 확장 시.
- `sidebar`: 대시보드/문서 레이아웃으로 확장 시 (현재는 헤더 기반 마케팅 사이트 셸만 구현).
- 상태관리 라이브러리(zustand 등), 인증(next-auth 등), 백엔드 연동, i18n: 범위 밖으로 명시.

---

# Part 4. 실제 레이아웃/파일 구현 상세

## 4.0 설치/검증 순서 (전체 실행 순서)

```
# 1군
npx shadcn add card badge separator dropdown-menu sonner input label sheet navigation-menu -y
# next-themes가 자동 설치되지 않았다면:
npm install next-themes

# 2군
npx shadcn add form field -y
npm install react-hook-form zod @hookform/resolvers
```
각 `npx shadcn add` 직후 생성된 `components/ui/*.tsx` 파일을 열어 실제 export 이름을 확인하고, 이후 코드 스니펫의 import가 이와 일치하는지 검증하는 단계를 반드시 거친다(특히 form, field, sheet, navigation-menu).

## 4.1 components/theme-provider.tsx
```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## 4.2 components/mode-toggle.tsx
```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="테마 전환">
          <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>라이트</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>다크</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>시스템</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```
(DropdownMenuContent / DropdownMenuItem 등 실제 export 이름은 설치 직후 검증한다.)

## 4.3 메뉴 데이터 정의 (공용, 신규): components/layout/nav-items.ts
```ts
export const navItems = [
  { title: "홈", href: "/" },
  { title: "로그인 데모", href: "/login" },
] as const
```

## 4.4 components/layout/main-nav.tsx (데스크톱 가로 네비게이션)
```tsx
import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { navItems } from "@/components/layout/nav-items"

export function MainNav() {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink asChild>
              <Link href={item.href}>{item.title}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```
(NavigationMenuLink의 정확한 props/구조는 설치 직후 navigation-menu.tsx를 열어 확인, 버전에 따라 asChild 지원 여부가 다를 수 있음.)

## 4.5 components/layout/mobile-nav.tsx (Sheet 기반 모바일 메뉴)
```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navItems } from "@/components/layout/nav-items"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="메뉴 열기">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="mt-8 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```
(SheetContent가 SheetHeader/SheetTitle을 요구하는지(접근성 경고 방지) 설치 직후 확인 후 필요시 추가.)

## 4.6 components/layout/site-header.tsx
```tsx
import Link from "next/link"

import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          StarterKit
        </Link>
        <div className="flex items-center gap-2">
          <MainNav />
          <ModeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
```

## 4.7 components/layout/site-footer.tsx
```tsx
export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-5xl px-4 text-sm text-muted-foreground">
        (c) {new Date().getFullYear()} StarterKit. All rights reserved.
      </div>
    </footer>
  )
}
```

## 4.8 app/layout.tsx (수정본)
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "모던 웹 스타터킷",
    template: "%s | 모던 웹 스타터킷",
  },
  description: "Next.js, TypeScript, TailwindCSS, shadcn 기반 웹 개발 스타터킷",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```
(Toaster export 이름/props는 components/ui/sonner.tsx 설치 직후 확인.)

## 4.9 app/page.tsx (스타터킷 데모 랜딩)
```tsx
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stack = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "react-hook-form",
  "zod",
]

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-col items-start gap-4">
        <Badge>빠른 시작</Badge>
        <h1 className="text-3xl font-bold tracking-tight">모던 웹 스타터킷</h1>
        <p className="max-w-2xl text-muted-foreground">
          다크모드, 반응형 네비게이션, 폼 검증까지 미리 갖춘 Next.js 스타터킷입니다.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">로그인 폼 데모 보기</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stack.map((name) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              프로젝트에 이미 구성되어 있습니다.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## 4.10 lib/validations/login.ts (zod 스키마, 신규)
```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
})

export type LoginValues = z.infer<typeof loginSchema>
```

## 4.11 components/forms/login-form.tsx (react-hook-form + zod + shadcn form)
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { loginSchema, type LoginValues } from "@/lib/validations/login"

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(values: LoginValues) {
    console.log(values)
    toast.success("로그인 폼 검증 성공 (데모)")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>
    </Form>
  )
}
```
주의: Form, FormField, FormItem, FormLabel, FormControl, FormMessage는 예상 API이며, npx shadcn add form field 설치 직후 components/ui/form.tsx / field.tsx를 실제로 열어 export 이름과 render={({ field }) => ...} 시그니처가 일치하는지 검증 후, 다르면 이 스니펫을 실제 API에 맞게 조정한다.

## 4.12 app/(demo)/login/page.tsx (데모 페이지)
```tsx
import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <LoginForm />
    </div>
  )
}
```

## 4.13 정적 자산 정리
public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg 삭제 (4.9에서 페이지 교체 후 더 이상 참조 안 됨). app/favicon.ico는 유지.

## 4.14 README.md 재작성 (한글)
- 기술스택, 폴더 구조(L1~L4 계층 설명 포함), 개발 서버 실행법.
- shadcn 컴포넌트 추가법(npx shadcn add <component>), 3군 확장 컴포넌트 안내.
- 다크모드/네비게이션/폼 데모 사용법.

---

# 구현 순서 (전체)

1. `npx shadcn add card badge separator dropdown-menu sonner input label sheet navigation-menu -y` 실행 -> 각 생성 파일 열람해 실제 export 확인, next-themes 자동 설치 여부 확인(안 됐으면 npm install next-themes)
2. components/theme-provider.tsx, components/mode-toggle.tsx 작성
3. components/layout/nav-items.ts, main-nav.tsx, mobile-nav.tsx 작성
4. components/layout/site-header.tsx, site-footer.tsx 작성
5. app/layout.tsx 수정 (ThemeProvider, 헤더/푸터, Toaster, metadata, lang="ko", suppressHydrationWarning)
6. app/page.tsx 교체
7. public/*.svg 5종 삭제
8. `npx shadcn add form field -y` 실행 -> form.tsx/field.tsx 열람해 실제 API 확인
9. `npm install react-hook-form zod @hookform/resolvers`
10. lib/validations/login.ts 작성
11. components/forms/login-form.tsx 작성 (8단계에서 확인한 실제 API에 맞춰 조정)
12. app/(demo)/login/page.tsx 작성
13. README.md 재작성

# 검증

- npm run dev 실행 후 브라우저 확인:
  - 헤더: 데스크톱 폭에서 MainNav(가로 메뉴) 노출, 모바일 폭(또는 브라우저 축소)에서 햄버거 버튼과 Sheet 슬라이드 패널 동작 확인.
  - ModeToggle로 라이트/다크/시스템 전환 시 .dark 클래스 토글 및 hydration 경고 없는지 확인.
  - /login 페이지에서 빈 값 제출 시 zod 에러 메시지 노출, 올바른 값 제출 시 sonner 토스트 노출 확인.
- npm run lint 통과 확인.
- npm run build 성공 확인 (타입 에러 없는지 포함, 특히 form/field API 불일치 여부).

# 3군 확장 지점 (이번엔 미구현, 문서화만)

- table(+ TanStack Table), command(Cmd+K), carousel, chart(Recharts), calendar, combobox, tabs, accordion, breadcrumb, pagination, sidebar.
- 상태관리/인증/백엔드/i18n은 범위 밖.
