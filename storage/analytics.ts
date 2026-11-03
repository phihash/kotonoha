import * as amplitude from "@amplitude/analytics-react-native";

// 言葉と説明の中身は送らない。ユーザー ID も送らず、端末ごとの ID だけで集計する
amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!, undefined, {
  trackingOptions: { adid: false },
});

export const track = (event: string) => amplitude.track(event);
