# 모던 웹 스타터킷

다크모드, 반응형 네비게이션, 폼 검증까지 미리 갖춘 Next.js 기반 웹 개발 스타터킷입니다.

## 기술스택

- **Next.js 16.2.12** — App Router 기반 React 프레임워크
- **TypeScript** — 정적 타입 검사
- **Tailwind CSS v4** — CSS 우선 유틸리티 스타일링
- **shadcn (v4.16.0)** — 복사해서 쓰는 컴포넌트 라이브러리 (radix-nova 스타일)
- **lucide-react** — 아이콘 라이브러리
- **react-hook-form + zod** — 폼 검증 (마지막 단계에서 추가)
- **next-themes** — 다크모드 관리

## 폴더 구조

```
app/                          # Next.js App Router
├── (demo)/                   # 데모 라우트 그룹 (URL에 포함되지 않음)
│   └── login/
│       └── page.tsx          # 로그인 폼 데모 페이지
├── layout.tsx                # 루트 레이아웃 (ThemeProvider, 헤더/푸터)
├── page.tsx                  # 홈페이지 (스타터킷 소개)
└── globals.css               # 전역 스타일 (CSS 변수 기반 다크모드)

components/
├── ui/                       # L1. Primitive (shadcn 컴포넌트)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── field.tsx             # 폼 필드 기본 단위
│   ├── dropdown-menu.tsx
│   ├── sheet.tsx             # 모바일 슬라이드 패널
│   ├── navigation-menu.tsx
│   ├── sonner.tsx            # 토스트 알림
│   ├── badge.tsx
│   └── ... (다른 shadcn 컴포넌트)
├── forms/                    # L2. Composite (비즈니스 로직 포함 폼)
│   └── login-form.tsx        # react-hook-form + zod 폼 예시
├── layout/                   # L3. Layout (페이지 셸)
│   ├── site-header.tsx       # 헤더 (로고, 네비게이션, 다크모드 토글)
│   ├── site-footer.tsx       # 푸터
│   ├── main-nav.tsx          # 데스크톱 네비게이션 (가로 메뉴)
│   ├── mobile-nav.tsx        # 모바일 네비게이션 (Sheet 기반 슬라이드)
│   └── nav-items.ts          # 네비게이션 메뉴 데이터
├── theme-provider.tsx        # Providers 레이어 (next-themes 래퍼)
└── mode-toggle.tsx           # 다크모드 토글 버튼

lib/
├── utils.ts                  # cn() 유틸리티 (classname 병합)
└── validations/
    └── login.ts              # Utility 레이어 (zod 검증 스키마)
```

### 계층 구조 설명

- **L1 Primitive** (`components/ui/`): 더 이상 쪼갤 수 없는 단일 UI 단위. shadcn CLI로 설치된 그대로 사용.
- **L2 Composite** (`components/forms/`, 메뉴 데이터): 2개 이상의 Primitive를 조합한 상호작용 패턴. 프로젝트 도메인에 맞춤.
- **L3 Layout** (`components/layout/`): 모든 페이지를 감싸는 반복되는 뼈대 (헤더/푸터).
- **L4 Page** (`app/**/page.tsx`): 실제 라우트에 대응하는 화면.
- **Providers**: 전역 컨텍스트 (테마 등).
- **Utility/Validation**: UI가 아닌 순수 로직.

## 개발 서버 시작

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 주요 기능

### 다크모드

- `ModeToggle` 컴포넌트(헤더 우측)로 라이트/다크/시스템 모드 전환
- `next-themes` 기반, CSS 변수로 스타일 관리
- `app/globals.css`에 `@custom-variant dark` 정의로 `.dark` 클래스 기반 작동

### 반응형 네비게이션

- **데스크톱** (md 이상): 가로 메뉴바 (`MainNav`)
- **모바일** (md 미만): 햄버거 버튼 → Sheet 슬라이드 패널 (`MobileNav`)
- 메뉴 항목은 `components/layout/nav-items.ts`에서 관리

### 폼 검증

- **react-hook-form**: 성능 최적화된 폼 상태 관리
- **zod**: 런타임 타입 검증 및 스키마 정의
- **shadcn field**: 일관된 폼 필드 UI
- 예시: `/login` 페이지의 로그인 폼

## shadcn 컴포넌트 추가하기

현재 설치된 컴포넌트:
- 1군(필수): `card`, `badge`, `separator`, `dropdown-menu`, `sonner`, `input`, `label`, `sheet`, `navigation-menu`
- 2군(권장): `field`

### 새로운 컴포넌트 추가 예시

```bash
npx shadcn add <component-name> -y
```

### 3군 확장 컴포넌트 (향후 필요시 추가)

- **테이블**: `npx shadcn add table` (TanStack Table과 조합 권장)
- **커맨드 팔레트**: `npx shadcn add command` (Cmd+K 검색)
- **캐러셀**: `npx shadcn add carousel` (Embla 기반)
- **차트**: `npx shadcn add chart` (Recharts 기반)
- **날짜 선택**: `npx shadcn add calendar`
- **자동완성**: `npx shadcn add combobox`
- **탭/아코디언**: `npx shadcn add tabs`, `npx shadcn add accordion`
- **페이지네이션/브레드크럼**: `npx shadcn add pagination`, `npx shadcn add breadcrumb`
- **사이드바**: `npx shadcn add sidebar` (대시보드/문서 레이아웃 확장시)

## 빌드 및 배포

```bash
npm run build
npm run start
```

## 타입 체크 및 린트

```bash
npm run lint
```

## 주의사항

- `components/ui/` 파일들은 shadcn CLI로 설치된 것이므로 직접 수정하면 업데이트 시 덮어씌워질 수 있습니다. 커스터마이징이 필요하면 `components/` 아래 Composite 계층에서 별도 래퍼를 만드세요.
- 메타데이터(`title`, `description` 등)는 `app/layout.tsx`에서 `ko`(한글) 기준으로 설정되어 있습니다. 필요시 `metadataBase`의 URL을 실제 배포 도메인으로 변경하세요.
- 폼 검증은 현재 UI/에러 표시만 구현되어 있습니다. 실제 백엔드 연동은 `/login` 페이지의 `LoginForm` 컴포넌트에서 `onSubmit` 로직을 추가해서 구현하세요.

## 다음 단계

1. `/login` 페이지를 참고해 다른 폼을 추가하기
2. 필요한 shadcn 컴포넌트 3군에서 추가하기
3. 실제 백엔드/인증 로직 통합하기 (next-auth, 외부 API 등)
4. 상태관리 필요시 zustand, jotai 등의 라이브러리 추가

## 라이선스

MIT
