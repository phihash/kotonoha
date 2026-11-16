import { router } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";
import { MemoList, type Filter } from "../components/MemoList";

const FILTERS: Filter[] = [
  ["すべて", "grid-outline", () => true, "まだメモはありません"],
  ["リンクあり", "link-outline", (m) => !!m.urls?.length, "リンクのあるメモはまだありません"],
];

export default function Home() {
  // 共有シートから来たら、URL と残りの文を入れた入力画面を開く
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent.webUrl ?? "";
    const text = (shareIntent.text ?? "").replace(url, "").trim();
    router.push({ pathname: "/word", params: { url, text } });
    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  return <MemoList filters={FILTERS} add="/word" />;
}
