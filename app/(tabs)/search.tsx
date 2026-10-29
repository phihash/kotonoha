import { MemoList, type Filter } from "../../components/MemoList";

const FILTERS: Filter[] = [
  ["すべて", "grid-outline", () => true, "まだメモはありません"],
  ["知識", "book-outline", (m) => m.kind !== "want", "知識はまだありません"],
  ["やりたいこと", "heart-outline", (m) => m.kind === "want", "やりたいことはまだありません"],
];

export default function Search() {
  return <MemoList filters={FILTERS} search />;
}
