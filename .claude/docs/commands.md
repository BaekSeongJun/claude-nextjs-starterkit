# 자주 사용하는 명령어 & 운영

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

## 개발 & 프로덕션 명령어

### 개발 서버
```bash
npm run dev              # Turbopack 개발 서버 시작 (http://localhost:3000)
```

### 프로덕션 빌드 & 시작
```bash
npm run build            # 배포용 빌드
npm run start            # 프로덕션 서버 시작
```

### 코드 품질
```bash
npm run lint             # ESLint 실행 (Next.js core-web-vitals + TypeScript 설정)
```

### 컴포넌트 라이브러리 관리
```bash
npx shadcn add <name> -y # shadcn/ui 컴포넌트 추가
# 예시:
# npx shadcn add table -y
# npx shadcn add dialog -y
```

---

## 중요한 주의사항

### 1. L1 컴포넌트 (`components/ui/`)는 손대면 안 됨

**규칙:** `components/ui/` 파일을 절대 직접 수정하지 마세요.

- 이 파일들은 `shadcn add` CLI에서 생성하고 관리합니다
- 수정하면 **CLI를 실행할 때마다 덮어씌워집니다**
- **커스터마이징 방법:** L1 프리미티브를 커스터마이징해야 하면:
  1. `components/forms/` 또는 다른 L2 위치에 래퍼 컴포넌트를 만듭니다
  2. L1에서 원본을 임포트합니다
  3. 커스텀 로직, 스타일, props를 추가합니다
  4. 전체 앱에서 래퍼를 사용합니다

**예시:**
```ts
// ❌ 이렇게 하지 마세요 — 덮어씌워집니다
// components/ui/button.tsx (수정 금지)

// ✅ 이렇게 하세요
// components/forms/custom-button.tsx
import { Button } from '@/components/ui/button'

export function CustomButton({ special, ...props }) {
  return <Button className={special ? 'custom-style' : ''} {...props} />
}
```

### 2. 폼 백엔드는 연결되지 않음

폼 제출 핸들러 (예: `/login`의 `LoginForm.onSubmit()`)는 현재 **스텁**입니다.

연결하려면:
1. API 라우트 생성 (`app/api/login/route.ts` 등)
2. 또는 서버 액션 생성 (`lib/actions/login.ts`)
3. 또는 외부 API 엔드포인트 호출
4. 폼 컴포넌트의 `onSubmit` 핸들러를 백엔드 호출로 업데이트

**현재 동작:** 로그인 폼을 제출하면 콘솔에 값을 로그할 뿐 실제 인증은 되지 않습니다.

### 3. 테스트 프레임워크 설정되지 않음

이 프로젝트에는 테스트 러너가 설정되지 않았습니다:
- `package.json`에 `test` 스크립트가 **정의되지 않음**
- 테스트 파일(`.test.tsx`, `.spec.tsx`)이 없음
- Jest, Vitest 같은 테스트 라이브러리가 설치되지 않음

**테스트가 필요하면:**
1. Jest나 Vitest를 설치합니다 (권장: 모던 React 프로젝트에는 Vitest)
2. `package.json`에 `test` 스크립트를 추가합니다
3. 컴포넌트 옆에 테스트 파일을 만듭니다
4. [테스트 워크플로](./subagent-workflows.md#테스트-워크플로)를 사용해 테스트 이슈를 진단합니다

---

## 트러블슈팅

### 이슈: `npm run build`가 TypeScript 에러로 실패

**단계:**
1. 에러 메시지를 주의 깊게 읽습니다 — Next.js 16에는 `params`와 `searchParams`에 대한 특정 요구사항이 있습니다 ([Next.js 16 브레이킹 체인지](./nextjs16-breaking-changes.md) 참고)
2. `params`나 `searchParams`를 동기로 접근하고 있는지 확인합니다 (`await` 또는 `use()` 사용해야 함)
3. 이슈가 명확하지 않으면 [디버거 워크플로](./subagent-workflows.md#디버깅-워크플로)를 실행합니다

### 이슈: 스타일이 적용되지 않거나 다크모드가 작동하지 않음

**단계:**
1. `ThemeProvider`가 `app/layout.tsx`의 전체 앱을 래싸고 있는지 확인합니다
2. `app/globals.css`에 다크모드 변형 설정이 포함되어 있는지 확인합니다
3. 헤더나 레이아웃 컴포넌트에 `ModeToggle`이 포함되어 있는지, `'use client'`로 마크되어 있는지 확인합니다
4. `.next/` 캐시를 지웁니다: `rm -rf .next` (또는 OS 파일 관리자 사용)
5. 개발 서버를 재시작합니다: `npm run dev`

### 이슈: shadcn 컴포넌트가 예상대로 작동하지 않음

**단계:**
1. shadcn 문서를 읽고 컴포넌트를 올바르게 사용하는지 확인합니다
2. 커스터마이징이 필요하면 L2에서 래퍼를 만듭니다 (위의 L1 주의사항 참고)
3. `components/ui/`의 파일을 수정하지 마세요 — 장기적으로 작동하지 않습니다

### 이슈: 폼 검증이 작동하지 않거나 에러가 표시되지 않음

**단계:**
1. zod 스키마가 `lib/validations/`에 정의되어 있는지 확인합니다 (예: `loginSchema`)
2. 폼이 `useForm()`에서 `zodResolver(loginSchema)`를 사용하는지 확인합니다
3. 폼이 `Field` + `FieldLabel` + `FieldContent` + `FieldError`를 사용하는지 확인합니다 (raw inputs 아님)
4. 폼 필드의 `name` 속성이 zod 스키마의 필드명과 일치하는지 확인합니다 (일반적인 실수: 오타)
5. 문제가 지속되면 [코드 리뷰 워크플로](./subagent-workflows.md#코드-리뷰-워크플로)를 실행합니다

---

## 관련 리소스

- **Next.js 16 브레이킹 체인지:** [nextjs16-breaking-changes.md](./nextjs16-breaking-changes.md)에서 중요한 API 변경사항 확인
- **아키텍처:** [architecture.md](./architecture.md)에서 4-레이어 컴포넌트 구조 확인
- **패턴:** [patterns.md](./patterns.md)에서 구현 예시(다크모드, 폼, 라우팅) 확인
- **서브에이전트 워크플로:** [subagent-workflows.md](./subagent-workflows.md)에서 코드 리뷰, 디버거, 테스트 러너 언제 사용할지 확인

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
