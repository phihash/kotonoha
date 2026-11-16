// theme.ts で定義したトークンが、どこかで使われているかを確かめる。
// 使わなくなった値が残ると、新しい画面を作るときに「今ある名前」として選ばれてしまうため。
import { readFileSync, readdirSync } from "node:fs";
import * as theme from "../components/theme.ts";

const files = readdirSync(".", { recursive: true })
  .filter((f) => /^(app|components)\/.*\.tsx?$/.test(f))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const unused = Object.entries(theme).flatMap(([group, tokens]) =>
  Object.keys(tokens)
    .filter((key) => !new RegExp(`\\b${group}(\\.${key}\\b|\\[${key}\\])`).test(files))
    .map((key) => `${group}.${key}`),
);

if (unused.length) {
  console.error(`theme.ts に使われていないトークンがあります。消してください:\n  ${unused.join("\n  ")}`);
  process.exit(1);
}
