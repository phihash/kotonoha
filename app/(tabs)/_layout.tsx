import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect } from "react";

const TABS = [
  ["index", "知識", "book"],
  ["want", "やりたいこと", "heart"],
  ["search", "検索", "search"],
  ["settings", "設定", "settings"],
] as const;

export default function TabLayout() {
  // 共有シートから来たら、URL と残りの文を入れた入力画面を開く
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent.webUrl ?? "";
    const text = (shareIntent.text ?? "").replace(url, "").trim();
    router.push({ pathname: "/word", params: { kind: "phrase", url, text } });
    resetShareIntent();
  }, [hasShareIntent]);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#192543" }}>
      {TABS.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            headerTitle: name === "index" ? "コトノハメモ" : title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? icon : `${icon}-outline`} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
