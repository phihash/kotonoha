import AsyncStorage from "@react-native-async-storage/async-storage";
import { Share } from "react-native";
import { apiFetch, isSignedIn } from "./auth";

export type Memo = {
  id: string;
  word: string;
  description: string;
  // 参照リンク。0005 より前に端末へ保存したメモにはない
  urls?: string[];
  created_at: number;
  // 0004 より前に端末へ保存したメモにはない
  updated_at?: number;
};

type Input = Pick<Memo, "word" | "description" | "urls">;

// 文字数の上限。kotonoha-api の検証と同じ値にする
export const MAX = { word: 100, description: 3000 };

// サインインしていない間は端末だけに保存する
const LOCAL_KEY = "memos";
const readLocal = async (): Promise<Memo[]> => JSON.parse((await AsyncStorage.getItem(LOCAL_KEY)) ?? "[]");
const writeLocal = (memos: Memo[]) => AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(memos));

async function request(path: string, init?: RequestInit) {
  const res = await apiFetch(`/memos${path}`, init);
  if (!res.ok) throw new Error(`通信に失敗しました (${res.status})`);
  return res;
}

export async function getMemos(): Promise<Memo[]> {
  if (!(await isSignedIn())) return readLocal();
  return (await request("")).json();
}

export async function addMemo(input: Input): Promise<void> {
  if (!(await isSignedIn())) {
    const now = Date.now();
    const memo = { id: Math.random().toString(36).slice(2), ...input, created_at: now, updated_at: now };
    return writeLocal([memo, ...(await readLocal())]);
  }
  await request("", { method: "POST", body: JSON.stringify(input) });
}

export async function updateMemo({ id, ...input }: Input & { id: string }): Promise<void> {
  if (!(await isSignedIn())) {
    return writeLocal((await readLocal()).map((m) => (m.id === id ? { ...m, ...input, updated_at: Date.now() } : m)));
  }
  await request(`/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteMemo(id: string): Promise<void> {
  if (!(await isSignedIn())) return writeLocal((await readLocal()).filter((m) => m.id !== id));
  await request(`/${id}`, { method: "DELETE" });
}

// OS の共有シートで本文とリンクをテキストとして送る
export const shareMemo = (m: Memo) =>
  Share.share({ message: [m.word, m.description, ...(m.urls ?? [])].filter(Boolean).join("\n") });

// サインイン直後に端末のメモをアカウントへ移す。1件ずつ消すので途中で失敗しても重複しない
// ponytail: 登録日時はサーバーで付け直すので移した時刻になる。元の日時が要るなら API で created_at を受ける
export async function uploadLocalMemos(): Promise<void> {
  const local = await readLocal();
  for (const memo of [...local].reverse()) {
    await request("", { method: "POST", body: JSON.stringify(memo) });
    await writeLocal((await readLocal()).filter((m) => m.id !== memo.id));
  }
}
