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

이 커맨드는 다음 리뷰 기준을 따릅니다: [코드 리뷰 기준](../../docs/review-criteria.md) 문서를 참고하세요.

리뷰 기준에 포함된 내용: Bug & Edge Cases, Performance & Optimizations, Security & Data Handling, Readability & Architecture (4-1~4-3), 4-레이어 컴포넌트 레이어 구조 준수.

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
