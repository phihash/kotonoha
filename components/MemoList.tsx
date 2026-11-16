import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from "react-native";
import { getMemos, shareMemo, type Memo } from "../storage/memos";
import { colors, space, radius, fontSize, fontWeight, shadow } from "./theme";

// ページの og:image を端末から直接取りに行く。取れなければ null
// ponytail: 起動ごとに取り直す。重くなったら API 側で保存時に取って urls と一緒に持つ
async function getOgImage(url: string) {
  const html = await (await fetch(url)).text();
  const tag = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*>/i)?.[0];
  const src = tag?.match(/content=["']([^"']+)["']/i)?.[1];
  return src ? new URL(src.replace(/&amp;/g, "&"), url).href : null;
}

function LinkRow({ url }: { url: string }) {
  const { data: image } = useQuery({ queryKey: ["og", url], queryFn: () => getOgImage(url), staleTime: Infinity, retry: false });
  return (
    <Pressable style={styles.linkRow} onPress={() => Linking.openURL(url)}>
      {image && <Image source={{ uri: image }} style={styles.thumb} />}
      <Text style={styles.link} numberOfLines={1}>
        <Ionicons name="link-outline" size={13} /> {url.replace(/^https?:\/\//, "")}
      </Text>
    </Pressable>
  );
}

// [タブ名, アイコン, 絞り込み, 空のときの文]。並びの順 = スワイプのページの順
export type Filter = readonly [string, keyof typeof Ionicons.glyphMap, (m: Memo) => boolean, string];

// メモの一覧。filters で何を出すか、add で＋の行き先を決める
export function MemoList({ filters, add }: { filters: readonly Filter[]; add?: Href }) {
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollViewInstance>(null);
  const {
    data: memos = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["memos"],
    queryFn: getMemos,
  });
  const showPage = (i: number) => {
    setPage(i);
    pager.current?.scrollTo({ x: i * width });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {filters.map(([label, icon], i) => {
            const active = page === i;
            return (
              <Pressable key={label} style={[styles.pill, active && styles.pillActive]} onPress={() => showPage(i)}>
                <Ionicons name={icon} size={15} color={active ? colors.onPrimary : colors.primary} />
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      {/* 横スワイプでフィルターを切り替える（RN 標準の paging） */}
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {filters.map(([label, , test, empty]) => (
          <FlatList
            key={label}
            style={{ width }}
            data={memos.filter(test)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={{ pathname: "/word", params: { id: item.id } }} asChild>
                <Pressable style={styles.memo}>
                  <View style={styles.meta}>
                    <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("ja-JP")}</Text>
                    <Pressable onPress={() => shareMemo(item)} hitSlop={10} accessibilityLabel="共有">
                      <Ionicons name="share-outline" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  <Text style={[styles.word, !item.word && styles.untitled]}>{item.word || "未設定"}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  {item.urls?.map((u, i) => <LinkRow key={i} url={u} />)}
                </Pressable>
              </Link>
            )}
            ListEmptyComponent={
              isPending ? undefined : (
                <Text style={styles.empty} onPress={isError ? () => refetch() : undefined}>
                  {isError ? "読み込めませんでした（タップで再読み込み）" : empty}
                </Text>
              )
            }
            onRefresh={refetch}
            refreshing={false}
            contentContainerStyle={{ paddingHorizontal: space[16], paddingBottom: space[96] }}
          />
        ))}
      </ScrollView>
      {add && (
        <Link href={add} asChild>
          <Pressable style={styles.fab} accessibilityLabel="追加">
            <Ionicons name="add" size={32} color={colors.onPrimary} />
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[8],
    paddingRight: space[16],
    paddingVertical: space[12],
  },
  pills: {
    gap: space[8],
    paddingLeft: space[16],
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[4],
    paddingHorizontal: space[12],
    paddingVertical: space[7],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: fontSize[14],
    color: colors.primary,
  },
  pillTextActive: {
    color: colors.onPrimary,
    fontWeight: fontWeight.bold,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: radius[30],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    ...shadow.fab,
  },
  memo: {
    paddingVertical: space[12],
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
    gap: space[4],
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    marginLeft: "auto",
    marginRight: space[12],
    fontSize: fontSize[12],
    color: colors.textMuted,
  },
  word: {
    fontSize: fontSize[18],
    fontWeight: fontWeight.bold,
  },
  description: {
    fontSize: fontSize[15],
    color: colors.textSub,
  },
  untitled: {
    color: colors.textMuted,
  },
  linkRow: {
    gap: space[6],
  },
  // OGP 画像の標準比率 1.91:1
  thumb: {
    width: "100%",
    aspectRatio: 1.91,
    borderRadius: radius[8],
    backgroundColor: colors.surface,
  },
  link: {
    fontSize: fontSize[13],
    color: colors.link,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: space[32],
  },
});
