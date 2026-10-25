import { MemoList, type Filter } from "../../components/MemoList";

const FILTERS: Filter[] = [
  ["すべて", "grid-outline", (m) => m.kind === "want", "行きたいお店や買いたい本を書いておけます"],
  ["リンクあり", "link-outline", (m) => m.kind === "want" && !!m.urls?.length, "リンクのあるものはまだありません"],
];

export default function Want() {
  return <MemoList filters={FILTERS} add={{ pathname: "/word", params: { kind: "want" } }} />;
}
