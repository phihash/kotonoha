// CLAUDE.md とスキルにバッククォートで書いた参照が、今のリポジトリと合っているかを確かめる。
// 古い参照が残ると、Claude はないファイルやトークンを探しに行く。
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import * as theme from "../components/theme.ts";

const SKILL = ".claude/skills/design-system/SKILL.md";
const docs = ["CLAUDE.md", ...readdirSync(".claude/skills").map((d) => `.claude/skills/${d}/SKILL.md`)];
const files = execSync("git ls-files -co --exclude-standard", { encoding: "utf8" }).split("\n");
const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
const TOKEN = new RegExp(`^(${Object.keys(theme).join("|")})(?:\\.(\\w+)|\\[(\\w+)\\])$`);
const PATH = /^[\w.+()\-/]+$/;
const errors = [];

for (const doc of docs) {
  for (const [, ref] of readFileSync(doc, "utf8").matchAll(/`([^`\n]+)`/g)) {
    const token = ref.match(TOKEN);
    const run = ref.match(/^npm run (\S+)$/);
    if (token) {
      if (!((token[2] ?? token[3]) in theme[token[1]])) errors.push(`${doc}: トークン ${ref} は theme.ts にない`);
    } else if (run) {
      if (!scripts[run[1]]) errors.push(`${doc}: ${ref} は package.json の scripts にない`);
    } else if (PATH.test(ref) && (ref.includes("/") || /\.(tsx?|m?js|json|md|sh)$/.test(ref))) {
      // フォルダを含むパスはその場所に、ファイル名だけならリポジトリのどこかにあればよい
      const ok = ref.includes("/") ? existsSync(ref) : files.some((f) => f.split("/").pop() === ref);
      if (!ok) errors.push(`${doc}: パス ${ref} が見つからない`);
    }
  }
}

// theme.ts にあるトークンは、どの場面で使うかをスキルに書く
const skill = readFileSync(SKILL, "utf8");
for (const [group, tokens] of Object.entries(theme)) {
  for (const key of Object.keys(tokens)) {
    const written = new RegExp(`\`${group}(\\.${key}\\b|\\[${key}\\])`).test(skill);
    if (!written) errors.push(`${SKILL}: ${group}.${key} の使い場面が書かれていない`);
  }
}

if (errors.length) {
  console.error(`ドキュメントの参照が今のリポジトリと合っていません:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
