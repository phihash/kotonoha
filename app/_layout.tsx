import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";
import { ShareIntentProvider } from "expo-share-intent";
import "../storage/analytics";
import { getUser } from "../storage/auth";
import { colors } from "../components/theme";

const queryClient = new QueryClient();

function RootStack() {
  const { data: user, isPending } = useQuery({ queryKey: ["user"], queryFn: getUser });
  if (isPending) return null;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal", headerTransparent: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "コトノハメモ",
          headerLeft: () => (
            <Link href="/settings" asChild>
              <Pressable hitSlop={10} accessibilityLabel="設定">
                <Ionicons name="menu" size={24} color={colors.primary} />
              </Pressable>
            </Link>
          ),
        }}
      />
      {/* 左上のメニューから、ドロワーのように左から出す */}
      <Stack.Screen name="settings" options={{ title: "設定", animation: "slide_from_left" }} />
      <Stack.Screen name="word" options={{ headerShown: false, presentation: "fullScreenModal" }} />
      {/* サインインは任意（審査 5.1.1(v)）。サインイン済みなら開けない */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false, presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Screen name="legal" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <QueryClientProvider client={queryClient}>
        <RootStack />
      </QueryClientProvider>
    </ShareIntentProvider>
  );
}
