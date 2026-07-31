# 커밋 계획

## Context
`/commit` 슬래시 커맨드를 `/git:commit`으로 네임스페이스를 변경하기 위해, 이전 커밋(`fd8f741`)에서 추가했던 `.claude/commands/commit.md` 파일이 `.claude/commands/git/commit.md`로 이동되었습니다. 내용은 동일하며 위치(및 커맨드 네임스페이스)만 바뀐 순수한 이동입니다.

## 변경사항 요약
- 삭제: `.claude/commands/commit.md`
- 추가: `.claude/commands/git/commit.md` (내용 동일)
- Git이 rename으로 인식함 (`git add` dry-run 결과: `remove` + `add` 쌍으로 감지)

의미 단위가 "커맨드 파일 이동" 하나뿐이므로 커밋도 1개로 진행합니다.

## 실행 단계
1. `git add .claude/commands/commit.md .claude/commands/git/commit.md` (또는 `git add -A -- .claude/commands/`)
2. `git commit -m "chore: /commit 커맨드를 /git:commit으로 이동"` (한글 메시지, Co-Authored-By 트레일러 포함)
3. `git status`, `git log -1 --stat`으로 결과 확인 (rename으로 표시되는지 확인)

푸시는 요청받지 않았으므로 진행하지 않습니다.
