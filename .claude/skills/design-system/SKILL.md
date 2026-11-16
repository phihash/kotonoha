---
name: design-system
description: 画面やコンポーネントのスタイルを書く・直すときに、components/theme.ts のどのトークンをどの場面で使うかを決める。新しい色・余白・文字サイズ・角丸・影が必要になったとき、theme.ts に値を足すときにも使う。
---

# デザイントークンの選び方

値は `components/theme.ts` にある。ここには、どの場面でどの名前を使うかと、値を足すときの決まりだけを書く。

## 場面ごとの名前

以下はどれも、今のコードで実際に使っている組み合わせ。

### 色

| 場面 | 名前 |
|---|---|
| 画面の背景 | `colors.background` |
| 見出し、行のラベル、タップできる文字 | `colors.primary` |
| 強調ボタン、選択中のピル、FAB の背景 | `colors.primary` |
| `primary` の上に置く文字とアイコン | `colors.onPrimary` |
| 長い本文（規約など） | `colors.text` |
| 補足の説明文 | `colors.textSub` |
| 日付、空の状態、タイトル未設定、リンクの添えアイコン | `colors.textMuted` |
| 入力欄のプレースホルダー | `colors.placeholder` |
| 未選択のピル、サムネイルの下地 | `colors.surface` |
| 押せないボタンの背景 / 文字 | `colors.surfaceDisabled` / `colors.disabled` |
| 枠線（設定のグループ、閉じるボタン） | `colors.border` |
| 区切り線（行の間、ソートボタンの枠） | `colors.divider` |
| 一覧のメモ同士の区切り線 | `colors.dividerLight` |
| 削除・サインアウトなど、元に戻せない操作の文字 | `colors.danger` |
| URL など外部へのリンク | `colors.link` |
| 影の色 | 画面では使わない。`colors.shadow` は `shadow.*` の中だけで使う |

### 文字

| 場面 | 名前 |
|---|---|
| サインイン画面のアプリ名 | `fontSize[28]` + `fontWeight.bold` |
| 入力画面のタイトル | `fontSize[22]` + `fontWeight.bold` |
| 一覧のタイトル | `fontSize[18]` + `fontWeight.bold` |
| 画面のタイトル、セクション見出し | `fontSize[17]` + `fontWeight.bold` |
| 設定の行ラベル | `fontSize[17]` |
| 入力画面の本文 | `fontSize[17]` + `lineHeight[26]` |
| ボタンの文字 | `fontSize[16]`（強調ボタンは `fontWeight.bold` も） |
| 規約の本文 | `fontSize[15]` + `lineHeight[24]` |
| 補足の説明 | `fontSize[15]` |
| ピルの文字（選択中は `fontWeight.bold`） | `fontSize[14]` |
| サインイン画面の説明文 | `fontSize[14]` + `lineHeight[22]` |
| 外部リンクの文字 | `fontSize[13]` |
| 日付、同意文 | `fontSize[12]` |

### 余白

| 場面 | 名前 |
|---|---|
| 画面の左右 | `space[16]`（全画面モーダルは `space[20]`） |
| 行の上下 | `space[12]`。設定の行は `space[14]` |
| 横に並んだ要素の間 | `space[8]` |
| アイコンと文字の間 | `space[4]`〜`space[6]` |
| セクションの間 | `space[20]`〜`space[32]` |
| FAB に隠れないよう、一覧の下に空ける余白 | `space[96]` |
| 一覧のピルの内側 | 上下 `space[7]`、左右 `space[12]` |
| サインイン画面のロゴとボタンの間 | `space[48]` |

### 角丸と影

| 場面 | 名前 |
|---|---|
| ピル | `radius.full` |
| 丸いボタン（高さ 44） | `radius[22]` |
| FAB（60×60） | `radius[30]` + `shadow.fab` |
| サムネイル | `radius[8]` |

## 値を足すとき

1. まず、今ある名前で足りないかを確かめる。上の表に近い場面があれば、その名前を使う。
2. 名前は見た目（`lightGray`、`big`）ではなく、意味（`textMuted`、`danger`）で付ける。
3. 値が同じでも、意味が違うなら別の名前にする。たとえば `colors.primary` と同じ色でも、役割が違えば別の名前を足す。
4. 足したら、この表にも場面を書き足す。
