# 서브에이전트 워크플로

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**

이 프로젝트는 세 가지 특화된 서브에이전트를 사용해 코드 리뷰, 디버깅, 테스트를 자동화합니다. 이 에이전트들은 읽기 전용이며 구조화된 진단 정보를 제공해 수동 수정을 안내합니다.

## 코드 리뷰 워크플로

### 언제 사용하나요

이 리포지토리에 코드를 구현하거나 수정한 후(새 컴포넌트, 페이지, 폼 로직 등), 작업이 완료되었다고 여기기 전에 `code-reviewer` 서브에이전트를 호출합니다.

### 호출 방법

```
Agent(subagent_type: "code-reviewer", prompt: "Review the changes I just made to <files>")
```

또는 슬래시 명령어:
```
/code-review:staff
```

### 무엇을 하나요

- **읽기 전용:** Read/Grep/Glob만 사용 — 파일을 수정하지 않고 발견사항만 보고합니다
- **초점:**
  - 버그 & 엣지 케이스 (null 검사, Next.js 16 Promise params, zod 검증)
  - 성능 & 최적화 (불필요한 리렌더링, useEffect 의존성)
  - 보안 & 데이터 처리 (하드코딩된 시크릿, 폼 검증 우회, XSS 위험)
  - 아키텍처 준수 (4-레이어 컴포넌트 구조, 파일 구성)
  - 코드 품질 (네이밍, 함수 길이, 주석 필요성)

### 출력 형식

서브에이전트는 다음을 반환합니다:
- **Executive Summary:** Pass / Needs Refactoring / Critical Issue
- **Critical Issues:** 배포를 막는 문제 (없으면 "없음")
- **Suggestions:** 차단하지 않는 개선사항 (코드 정리, 가독성)
- **Architecture Compliance:** 4-레이어 구조 검증
- **권장 다음 조치:** 메인 에이전트가 수정해야 할 것들 (우선순위 순)

### 수정사항 적용

1. 서브에이전트의 발견사항을 검토합니다
2. Edit을 사용해 언급된 파일을 수정합니다
3. **주의:** 서브에이전트는 수정하지 않습니다 — 검토 후 직접 적용하세요

### 스킵 조건

사소한 비기능적 변경만 스킵하세요 (예: 주석의 오타, README 수정).

---

## 디버깅 워크플로

### 언제 사용하나요

다음과 함께 버그가 보고될 때:
- 재현 방법
- 에러 스택트레이스
- 예상치 못한 동작이나 TypeScript 빌드 에러

### 호출 방법

```
Agent(subagent_type: "debugger", prompt: "Error message:\n...\n\nReproduce with:\n...")
```

### 무엇을 하나요

- **읽기 전용 + 제한된 Bash:** Read/Grep/Glob와 제한된 Bash (`git diff`, `git log`, `git status`, `npm run lint`, `npm run build`)를 사용합니다
- **근본 원인 분석(RCA) 수행:**
  - 실행 흐름을 추적해 버그가 발생하는 이유를 파악합니다
  - 문제의 정확한 파일과 줄 번호를 식별합니다
  - 버그 유형을 분류합니다 (Next.js 16 브레이킹 체인지, 폼 검증, 하이드레이션 불일치 등)
- **전문성:**
  - Next.js 16 브레이킹 체인지 (params/searchParams Promise 이슈, middleware → proxy.ts)
  - 폼 검증 (react-hook-form + zod 통합)
  - `'use client'` 경계 에러
  - L1 (프리미티브) 직접 수정 이슈
  - 하이드레이션 불일치 (next-themes)
  - 일반적인 React 이슈 (null/undefined, race condition, state mutation, 타입 불일치)

### 출력 형식

서브에이전트는 다음을 반환합니다:
- **🐛 Bug Summary & Root Cause:** 명확한 진단 (file:line 위치 포함)
- **🛠️ Proposed Fix:** 정확한 파일 위치, Before/After 코드 블록
- **⚠️ Regression Warning:** 가능한 부작용과 테스트할 내용
- **Reproduction Method:** 실제 에러 출력 (재현 가능한 경우)

### 수정사항 적용

1. 서브에이전트의 수정 제안을 검토합니다
2. Edit으로 지정된 file:line 위치를 수정합니다
3. **주의:** 서브에이전트는 수정하지 않습니다 — 검토 후 직접 적용하세요
4. `npm run build` 또는 `npm run lint`를 실행해 수정사항을 검증합니다

### 모범 사례

- 에러 메시지와 스택트레이스를 정확하게 서브에이전트에 전달하세요 — 세부 정보가 많을수록 진단이 빠릅니다
- 에러가 명확하지 않으면 먼저 `npm run build`를 실행하고 전체 출력을 공유하세요
- 서브에이전트는 최근 변경사항이 버그를 도입했을 가능성이 높으므로 `git diff`와 `git log`를 확인합니다

---

## 테스트 워크플로

### 언제 사용하나요

이 프로젝트에 테스트를 추가할 때 또는 실패한 테스트를 진단하려고 할 때 사용합니다. **주의:** 이 프로젝트는 현재 테스트 프레임워크가 **설정되지 않았습니다** (`test` 스크립트가 `package.json`에 없음). 테스트가 필요하면 테스트 러너 서브에이전트를 사용해 인프라를 설정하세요.

### 호출 방법

```
Agent(subagent_type: "test-runner", prompt: "Test output:\n...\n\nFailing test:\n...")
```

### 무엇을 하나요

- **읽기 전용 + 제한된 Bash:** Read/Grep/Glob과 제한된 Bash (`npm test`, `npm run test`, `git diff`, `git status`, `npm run lint`, `npm run build`)를 사용합니다
- **구분:**
  - **Production Code Bugs:** 구현 코드가 테스트 기대값과 맞지 않음
  - **Test Setup Issues:** 오래된 mocks, 잘못된 assertions, 누락된 환경변수
- **전문성:**
  - Next.js 16 `params`/`searchParams` Promise 처리 테스트
  - zod 스키마 버전 불일치 (스키마 변경 후 테스트 미업데이트)
  - 서버 컴포넌트 vs 클라이언트 테스트 경계 이슈 (`'use client'`와 async 컴포넌트)
  - Mock 만료 (예: 라이브러리 업데이트 후 `useTheme()` mock 구조 변경)

### 출력 형식

서브에이전트는 다음을 반환합니다:
- **🧪 Test Status:** 테스트 인프라 존재 여부와 현재 패스/실패 개수
- **🔧 Diagnosis & Proposed Changes:** 실패한 테스트별로 Production Bug 또는 Test Issue로 분류
- **📊 Coverage / Reliability Notes:** Flaky 테스트 경고, 누락된 엣지 케이스, 설정 권장사항
- **⚠️ Next.js 16 Checklist:** 테스트가 params/searchParams/`'use client'`를 올바르게 처리하는지 확인

### 수정사항 적용

1. 서브에이전트의 진단을 검토합니다
2. **Production Bug인 경우:** 구현 코드를 수정합니다 (테스트 아님)
3. **Test Issue인 경우:** 테스트 코드를 수정해 mocks이나 assertions를 고칩니다
4. `npm test`를 실행해 검증합니다 (서브에이전트는 수정하지 않습니다)

### 현재 상태 (테스트 없음)

지금 이 워크플로를 실행하면 서브에이전트가 테스트가 설정되지 않았음을 감지하고 Jest나 Vitest 최소 설정 지침을 제공합니다. 의존성을 설치하지는 않습니다 — 이건 당신의 책임입니다.

---

## 워크플로 요약 표

| 워크플로 | 트리거 | 에이전트 타입 | 출력 | 당신이 할 일 |
|---|---|---|---|---|
| **Code Review** | 코드 구현/수정 후 | `code-reviewer` | 발견사항 (버그, 성능, 보안, 아키텍처) | 검토 후 Edit으로 수정 |
| **Debugging** | 버그 발생 | `debugger` | 근본 원인 + file:line + Before/After 수정 | 검토 후 Edit으로 수정 |
| **Testing** | 테스트 추가 또는 진단 시 | `test-runner` | 테스트 상태 + 버그 분류 (Production/Test) | 검토 후 Edit으로 수정 |

**핵심 패턴:** 세 에이전트 모두 읽기 전용입니다. 보고하고 제안하면 당신이 검토해서 수정합니다.

---

**← [CLAUDE.md로 돌아가기](../../CLAUDE.md)**
