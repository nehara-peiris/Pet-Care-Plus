import { useEffect } from "react";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* 👇 Mount Toast globally */}
      <Toast topOffset={60} visibilityTime={3000} />
    </>
  );
}
