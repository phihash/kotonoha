import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { track } from "../storage/analytics";
import { addMemo, deleteMemo, MAX, shareMemo, updateMemo, type Memo } from "../storage/memos";
import { colors, space, radius, fontSize, lineHeight, fontWeight } from "../components/theme";

// 全画面の入力画面。id があれば編集、なければ新規
export default function WordScreen() {
  const params = useLocalSearchParams<{ id?: string; url?: string; text?: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const memo = queryClient.getQueryData<Memo[]>(["memos"])?.find((m) => m.id === params.id);
  const [word, setWord] = useState(memo?.word ?? "");
  const [description, setDescription] = useState(memo?.description ?? params.text ?? "");
  const [urls, setUrls] = useState(memo?.urls ?? (params.url ? [params.url] : []));
  const links = urls.map((u) => u.trim()).filter(Boolean);
  const canSave = !!description.trim() && links.every((u) => /^https?:\/\/\S+$/.test(u));
  const onError = (e: Error) => Alert.alert("エラー", e.message);
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ["memos"] });
    router.back();
  };
  const save = useMutation({
    mutationFn: async (input: Pick<Memo, "word" | "description" | "urls">) => {
      await (memo ? updateMemo({ id: memo.id, ...input }) : addMemo(input));
    },
    onSuccess: () => {
      track(memo ? "memo_updated" : "memo_created");
      done();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: deleteMemo,
    onSuccess: () => {
      track("memo_deleted");
      done();
    },
    onError,
  });

  const onSave = () => {
    if (canSave) save.mutate({ word: word.trim(), description: description.trim(), urls: links });
  };
  const confirmDelete = () =>
    Alert.alert("このメモを削除しますか？", "元に戻すことはできません。", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除する", style: "destructive", onPress: () => memo && remove.mutate(memo.id) },
    ]);

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.container, { paddingTop: top + space[8], paddingBottom: bottom }]}>
      <View style={styles.header}>
        <Pressable style={styles.close} onPress={() => router.back()} accessibilityLabel="閉じる">
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{memo ? "編集する" : "メモを書く"}</Text>
        <Pressable
          style={[styles.save, !canSave && styles.saveDisabled]}
          onPress={onSave}
          disabled={!canSave || save.isPending}
        >
          <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>保存</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.word}
        value={word}
        onChangeText={setWord}
        placeholder="タイトル"
        maxLength={100}
        maxLength={MAX.word}
        placeholderTextColor={colors.placeholder}
        autoFocus={!memo}
      />
      <TextInput
        style={styles.body}
        value={description}
        onChangeText={setDescription}
        placeholder="本文"
        // kotonoha-api の上限と同じ
        maxLength={2000}
        maxLength={MAX.description}
        placeholderTextColor={colors.placeholder}
        multiline
      />
      {urls.map((u, i) => (
        <View key={i} style={styles.urlRow}>
          <Ionicons name="link-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.url}
            value={u}
            onChangeText={(v) => setUrls(urls.map((x, j) => (j === i ? v : x)))}
            placeholder="https://"
            placeholderTextColor={colors.placeholder}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={!u}
          />
          <Pressable onPress={() => setUrls(urls.filter((_, j) => j !== i))} accessibilityLabel="リンクを削除">
            <Ionicons name="close-circle" size={20} color={colors.disabled} />
          </Pressable>
        </View>
      ))}
      {urls.length < 10 && (
        <Pressable style={styles.urlRow} onPress={() => setUrls([...urls, ""])}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addLink}>参照リンクを追加</Text>
        </Pressable>
      )}
      {memo && (
        <Pressable style={styles.delete} onPress={() => shareMemo(memo)}>
          <Text style={styles.shareText}>共有</Text>
        </Pressable>
      )}
      {memo && (
        <Pressable style={styles.delete} onPress={confirmDelete} disabled={remove.isPending}>
          <Text style={styles.deleteText}>削除</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space[20],
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space[16],
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: radius[22],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize[17],
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  save: {
    paddingHorizontal: space[20],
    height: 44,
    borderRadius: radius[22],
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  saveDisabled: {
    backgroundColor: colors.surfaceDisabled,
  },
  saveText: {
    fontSize: fontSize[16],
    fontWeight: fontWeight.bold,
    color: colors.onPrimary,
  },
  saveTextDisabled: {
    color: colors.disabled,
  },
  word: {
    fontSize: fontSize[22],
    fontWeight: fontWeight.bold,
    color: colors.primary,
    paddingVertical: space[12],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  body: {
    flex: 1,
    fontSize: fontSize[17],
    lineHeight: lineHeight[26],
    paddingTop: space[12],
    textAlignVertical: "top",
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[8],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  addLink: {
    fontSize: fontSize[15],
    paddingVertical: space[12],
    color: colors.primary,
  },
  url: {
    flex: 1,
    fontSize: fontSize[15],
    paddingVertical: space[12],
    color: colors.primary,
  },
  delete: {
    alignItems: "center",
    paddingVertical: space[12],
  },
  shareText: {
    color: colors.primary,
    fontSize: fontSize[16],
  },
  deleteText: {
    color: colors.danger,
    fontSize: fontSize[16],
  },
});
