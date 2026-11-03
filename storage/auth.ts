import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = "session-token";

export type User = { id: string; name: string; email: string };

export async function apiFetch(path: string, init?: RequestInit) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
}

export const isSignedIn = async () => !!(await SecureStore.getItemAsync(TOKEN_KEY));

const authFetch =(path: string, init?: RequestInit) => apiFetch(`/auth${path}`, init);

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME],
  });
  if (!credential.identityToken) throw new Error("Apple から identityToken が返りませんでした");

  const res = await authFetch("/sign-in/social", {
    method: "POST",
    body: JSON.stringify({
      provider: "apple",
      idToken: {
        token: credential.identityToken,
        // 名前は初回サインイン時しか Apple から届かない
        user: {
          name: {
            firstName: credential.fullName?.givenName ?? undefined,
            lastName: credential.fullName?.familyName ?? undefined,
          },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`サインインに失敗しました (${res.status})`);
  const { token } = await res.json();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getUser(): Promise<User | null> {
  if (!(await isSignedIn())) return null;
  const res = await authFetch("/get-session");
  if (!res.ok) return null;
  const session = await res.json();
  return session?.user ?? null;
}

export async function signOut(): Promise<void> {
  // 通信に失敗しても端末からは必ずサインアウトする
  try {
    await authFetch("/sign-out", { method: "POST", body: "{}" });
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function deleteAccount(): Promise<void> {
  // 削除にはサインインしたばかりのセッションが要る（Better Auth の freshAge）。
  // Face ID でもう一度サインインして本人確認も兼ねる
  await signInWithApple();
  const res = await authFetch("/delete-user", { method: "POST", body: "{}" });
  if (!res.ok) throw new Error(`アカウントを削除できませんでした (${res.status})`);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
