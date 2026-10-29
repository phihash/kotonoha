import { getShareExtensionKey } from "expo-share-intent";

// 共有シートから開いたときの URL はルートにないので一覧へ。中身は (tabs)/_layout で受け取る
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return path.includes(`dataUrl=${getShareExtensionKey()}`) ? "/" : path;
}
