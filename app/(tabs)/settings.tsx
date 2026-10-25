import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { track } from "../../storage/analytics";
import { deleteAccount, getUser, signOut } from "../../storage/auth";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: getUser });
  // 一覧は端末のメモ（空）に戻る
  const signedOut = () => {
    queryClient.setQueryData(["user"], null);
    queryClient.invalidateQueries({ queryKey: ["memos"] });
  };
  const logout = useMutation({
    mutationFn: signOut,
    onSettled: () => {
      track("sign_out");
      signedOut();
    },
  });
  const remove = useMutation({
    mutationFn: deleteAccount,
    onError: (e: any) => {
      if (e?.code !== "ERR_REQUEST_CANCELED") Alert.alert("削除できませんでした", e.message);
    },
    onSuccess: () => {
      track("account_deleted");
      signedOut();
    },
  });

  const confirmSignOut = () =>
    Alert.alert("サインアウトしますか？", "メモはアカウントに残り、もう一度サインインすると表示されます。", [
      { text: "キャンセル", style: "cancel" },
      { text: "サインアウト", onPress: () => logout.mutate() },
    ]);
  const confirmDelete = () =>
    Alert.alert(
      "アカウントを削除しますか？",
      "アカウントが削除されます。元に戻すことはできません。",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "削除する", style: "destructive", onPress: () => remove.mutate() },
      ],
    );

  return (
    <View style={styles.container}>
      <View style={[styles.group, styles.spaced]}>
        <Link href={{ pathname: "/legal", params: { doc: "terms" } }} asChild>
          <Pressable style={styles.row}>
            <Text style={styles.rowText}>利用規約</Text>
          </Pressable>
        </Link>
        <Link href={{ pathname: "/legal", params: { doc: "privacy" } }} asChild>
          <Pressable style={StyleSheet.flatten([styles.row, styles.rowBorder])}>
            <Text style={styles.rowText}>プライバシーポリシー</Text>
          </Pressable>
        </Link>
      </View>
      {user ? (
        <View style={styles.group}>
          <Pressable style={styles.row} onPress={confirmSignOut}>
            <Text style={styles.rowText}>サインアウト</Text>
          </Pressable>
          <Pressable
            style={[styles.row, styles.rowBorder]}
            onPress={confirmDelete}
            disabled={remove.isPending}
          >
            <Text style={[styles.rowText, styles.danger]}>アカウントを削除</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.group}>
          <Link href="/sign-in" asChild>
            <Pressable style={styles.row}>
              <Text style={styles.rowText}>Apple でサインイン（バックアップ）</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  group: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  spaced: {
    marginBottom: 32,
  },
  row: {
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  rowText: {
    fontSize: 17,
    color: "#192543",
  },
  danger: {
    color: "#C0392B",
  },
});
