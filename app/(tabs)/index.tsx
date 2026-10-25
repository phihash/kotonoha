import { MemoList, type Filter } from "../../components/MemoList";

const FILTERS: Filter[] = [
  ["すべて", "grid-outline", (m) => m.kind !== "want", "まだメモはありません"],
  ["言葉", "book-outline", (m) => m.kind === "word", "言葉はまだありません"],
  ["メモ", "chatbubble-ellipses-outline", (m) => m.kind === "phrase", "メモはまだありません"],
  ["Tips", "bulb-outline", (m) => m.kind === "tip", "Tipsはまだありません"],
  ["リンクあり", "link-outline", (m) => m.kind !== "want" && !!m.urls?.length, "リンクのあるメモはまだありません"],
];

export default function Knowledge() {
  return <MemoList filters={FILTERS} add="/new" />;
}
