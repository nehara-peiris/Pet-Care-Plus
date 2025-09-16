import { Stack } from "expo-router";
import { ThemeProvider } from "../../contexts/ThemeContext";

export default function TabsToStack() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="pets" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="records" />
        <Stack.Screen name="settings/index" />
      </Stack>
    </ThemeProvider>
  );
}
