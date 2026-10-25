module.exports = ({ config }) => {
  if (!process.env.EXPO_PUBLIC_API_URL) throw new Error("EXPO_PUBLIC_API_URL が設定されていません");
  return config;
};
