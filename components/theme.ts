export const colors = {
  primary: "#192543",
  onPrimary: "#F2E8D9",
  background: "#fff",
  surface: "#f2f2f2",
  surfaceDisabled: "#f0f0f0",
  text: "#333",
  textSub: "#555",
  textMuted: "#999",
  placeholder: "#aaa",
  disabled: "#bbb",
  border: "#ccc",
  divider: "#ddd",
  dividerLight: "#eee",
  danger: "#C0392B",
  link: "#3A6EA5",
  shadow: "#000",
};

// ponytail: 今使っている値をそのままトークンにしている。キー＝値なので、揃えるときはキーを減らして置き換える
export const space = { 4: 4, 6: 6, 7: 7, 8: 8, 12: 12, 14: 14, 16: 16, 20: 20, 32: 32, 48: 48, 96: 96 } as const;

export const radius = { 8: 8, 22: 22, 30: 30, full: 999 } as const;

export const fontSize = { 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 22: 22, 28: 28 } as const;

export const lineHeight = { 22: 22, 24: 24, 26: 26 } as const;

export const fontWeight = { bold: "bold" } as const;

export const shadow = {
  fab: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
} as const;
