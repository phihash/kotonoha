# ルールの置き場所

| 決まりの種類 | 置き場所 |
|---|---|
| 1ファイルで判定できる（デザイン値の直書き禁止など） | `lint/design.mjs`（`.oxlintrc.json` で有効化） |
| ファイルをまたいで判定する（未使用トークンなど） | `scripts/` |
| 判定できない（どの場面でどのトークンを使うか、値の足し方） | `.claude/skills/design-system/` |
| それ以外の最低限 | この CLAUDE.md |

決まりを足すときは、機械で判定できるかをまず考え、上から順に置き場所を選ぶ。

UI（スタイル・色・余白・文字）を触るときは、design-system スキルを読む。

# 構成

- `app/`: expo-router の画面。`app/(tabs)/` がタブ、`+native-intent.ts` は共有シートからの URL を振り分ける
- `components/`: 共通 UI。デザイントークンは `components/theme.ts` だけに置く
- `storage/`: API・認証・保存・計測。画面からは直接 fetch せず、ここを通す
- `ios/`: Xcode 管理（ShareExtension を含む）。lint の対象外

# ゲート

- pre-commit: betterleaks（秘密情報）
- pre-push: `npm run lint`、`npm run typecheck`（存在しないトークンなど）、`npm run check:tokens`、`npm run check:docs`（CLAUDE.md とスキルの参照が実在するか）
- フックは `.githooks/`。`npm install` の `prepare` で有効になる
- Claude の git commit: UI の差分があると一度止まり、design-system スキルでの見直しを求められる（`.claude/hooks/design-review.sh`）

# 注意

- `eas update --environment` は `.env.local` を読まない。`EXPO_PUBLIC_*` を足したら `eas env:create` も行う
