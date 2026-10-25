import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from "react-native";
import { getMemos, shareMemo, type Memo } from "../storage/memos";

const LABEL = { word: "言葉", phrase: "メモ", tip: "Tips" };
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

// タブの順 = スワイプのページの順
const FILTERS = [
  ["すべて", "grid-outline", () => true, "まだメモはありません"],
  ["言葉", "book-outline", (m: Memo) => m.kind === "word", "言葉はまだありません"],
  ["メモ", "chatbubble-ellipses-outline", (m: Memo) => m.kind === "phrase", "メモはまだありません"],
  ["Tips", "bulb-outline", (m: Memo) => m.kind === "tip", "Tipsはまだありません"],
  ["リンクあり", "link-outline", (m: Memo) => !!m.urls?.length, "リンクのあるメモはまだありません"],
] as const;
const SORTS = ["作成日時（新しい順）", "作成日時（古い順）", "最新更新日時順"] as const;

export default function Home() {
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();
  const pager = useRef<ScrollViewInstance>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>(SORTS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const {
    data: memos = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["memos"],
    queryFn: getMemos,
  });
  const q = query.trim().toLowerCase();
  const hits = q
    ? memos.filter((m) => [m.word, m.description, ...(m.urls ?? [])].some((t) => t.toLowerCase().includes(q)))
    : memos;
  // API は作成日時の新しい順で返す
  const sorted =
    sort === SORTS[1]
      ? [...hits].reverse()
      : sort === SORTS[2]
        ? [...hits].sort((a, b) => (b.updated_at ?? b.created_at) - (a.updated_at ?? a.created_at))
        : hits;
  const showPage = (i: number) => {
    setPage(i);
    pager.current?.scrollTo({ x: i * width });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable accessibilityLabel="設定">
                <Ionicons name="settings-outline" size={24} color="#192543" />
              </Pressable>
            </Link>
          ),
        }}
      />
      <View style={styles.bar}>
        {/* 並び替え以外は横にスクロールさせ、狭い画面でもはみ出さないようにする */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {FILTERS.map(([label, icon], i) => {
            const active = page === i;
            return (
              <Pressable key={label} style={[styles.pill, active && styles.pillActive]} onPress={() => showPage(i)}>
                <Ionicons name={icon} size={15} color={active ? "#F2E8D9" : "#192543"} />
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={[styles.pill, styles.sortButton]} onPress={() => setSortOpen(!sortOpen)}>
          <Text style={styles.pillText}>並び替え</Text>
          <Ionicons name={sortOpen ? "chevron-up" : "chevron-down"} size={14} color="#192543" />
        </Pressable>
      </View>
      {searchOpen && (
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="言葉やメモを検索"
            placeholderTextColor="#aaa"
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      )}
      {/* 横スワイプでフィルターを切り替える（RN 標準の paging） */}
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {FILTERS.map(([label, , test, empty]) => (
          <FlatList
            key={label}
            style={{ width }}
            data={sorted.filter(test)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={{ pathname: "/word", params: { id: item.id } }} asChild>
                <Pressable style={styles.memo}>
                  <View style={styles.meta}>
                    <Text style={styles.chip}>{LABEL[item.kind]}</Text>
                    <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("ja-JP")}</Text>
                    <Pressable onPress={() => shareMemo(item)} hitSlop={10} accessibilityLabel="共有">
                      <Ionicons name="share-outline" size={16} color="#999" />
                    </Pressable>
                  </View>
                  {item.kind === "word" && <Text style={styles.word}>{item.word}</Text>}
                  <Text style={item.kind === "word" ? styles.description : styles.phrase}>{item.description}</Text>
                  {item.urls?.map((u, i) => <LinkRow key={i} url={u} />)}
                </Pressable>
              </Link>
            )}
            ListEmptyComponent={
              isPending ? undefined : (
                <Text style={styles.empty} onPress={isError ? () => refetch() : undefined}>
                  {q ? "見つかりませんでした" : isError ? "読み込めませんでした（タップで再読み込み）" : empty}
                </Text>
              )
            }
            onRefresh={refetch}
            refreshing={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
          />
        ))}
      </ScrollView>
      <Pressable
        style={[styles.fab, styles.searchFab]}
        onPress={() => {
          setSearchOpen(!searchOpen);
          setQuery("");
        }}
        accessibilityLabel={searchOpen ? "検索を閉じる" : "検索"}
      >
        <Ionicons name={searchOpen ? "close" : "search"} size={24} color="#192543" />
      </Pressable>
      <Link href="/new" asChild>
        <Pressable style={styles.fab} accessibilityLabel="追加">
          <Ionicons name="add" size={32} color="#F2E8D9" />
        </Pressable>
      </Link>
      {/* 並び替えのドロップダウン。外側をタップで閉じる */}
      {sortOpen && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSortOpen(false)} />
          <View style={styles.dropdown}>
            {SORTS.map((value, i) => (
              <Pressable
                key={value}
                style={[styles.option, i > 0 && styles.optionBorder]}
                onPress={() => {
                  setSort(value);
                  setSortOpen(false);
                }}
              >
                <Text style={styles.optionText}>{value}</Text>
                {sort === value && <Ionicons name="checkmark" size={18} color="#192543" />}
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 16,
    paddingVertical: 12,
  },
  pills: {
    gap: 8,
    paddingLeft: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f2f2f2",
  },
  pillActive: {
    backgroundColor: "#192543",
  },
  pillText: {
    fontSize: 14,
    color: "#192543",
  },
  pillTextActive: {
    color: "#F2E8D9",
    fontWeight: "bold",
  },
  sortButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdown: {
    position: "absolute",
    top: 52,
    right: 16,
    width: 230,
    zIndex: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  optionText: {
    fontSize: 15,
    color: "#192543",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#192543",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  searchFab: {
    right: 96,
    bottom: 44,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  memo: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    marginLeft: "auto",
    marginRight: 12,
    fontSize: 12,
    color: "#999",
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    color: "#192543",
    backgroundColor: "#F2E8D9",
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 15,
    color: "#555",
  },
  phrase: {
    fontSize: 16,
    color: "#192543",
  },
  linkRow: {
    gap: 6,
  },
  // OGP 画像の標準比率 1.91:1
  thumb: {
    width: "100%",
    aspectRatio: 1.91,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  link: {
    fontSize: 13,
    color: "#3A6EA5",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 32,
  },
});
