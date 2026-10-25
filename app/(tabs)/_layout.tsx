import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const TABS = [
  ["index", "知識", "book"],
  ["want", "やりたいこと", "heart"],
  ["settings", "設定", "settings"],
] as const;

export default function TabLayout() {
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
