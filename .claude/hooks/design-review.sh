#!/bin/sh
# Claude が git commit するとき、UI の差分があれば一度だけ止めて design-system スキルでの見直しを促す。
# 見直したステージ内容(ツリーのハッシュ)を覚えておき、同じ内容での再コミットは通す。
cd "$CLAUDE_PROJECT_DIR" || exit 0
git diff --cached --name-only | grep -qE '^(app|components)/.*\.tsx?$' || exit 0
tree=$(git write-tree)
mark="$(git rev-parse --git-dir)/design-reviewed"
[ "$(cat "$mark" 2>/dev/null)" = "$tree" ] && exit 0
echo "$tree" > "$mark"
jq -n '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny",
  permissionDecisionReason: "UI の差分がステージされています。design-system スキルを読み、git diff --cached のトークンの選び方が場面に合っているか見直してください。直したら git add してから、問題なければそのまま、もう一度 git commit してください。"}}'
