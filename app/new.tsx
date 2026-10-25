import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Sheet, useSheet } from "../components/Sheet";

const KINDS = [
  ["word", "言葉を書く", "book-outline"],
  ["phrase", "メモを書く", "chatbubble-ellipses-outline"],
  ["tip", "Tipsを書く", "bulb-outline"],
] as const;

// ＋ で開くメニュー。選ぶとシートを閉じて入力画面へ
export default function NewMenu() {
  const sheet = useSheet();
  return (
    <Sheet sheet={sheet}>
      <View style={styles.menu}>
        {KINDS.map(([kind, label, icon]) => (
          <Pressable
            key={kind}
            style={styles.row}
            onPress={() => sheet.close(() => router.replace({ pathname: "/word", params: { kind } }))}
          >
            <Ionicons name={icon} size={26} color="#192543" />
            <Text style={styles.text}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  menu: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#192543",
  },
});
