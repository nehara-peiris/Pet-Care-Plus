import { Stack } from "expo-router";

export default function TabsToStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="pets" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="records" />
    </Stack>
  );
}
