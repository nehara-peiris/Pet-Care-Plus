import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />       {/* Welcome */}
      <Stack.Screen name="(auth)" />     {/* Auth screens */}
      <Stack.Screen name="(tabs)" />     {/* Dashboard + others */}
    </Stack>
  );
}
