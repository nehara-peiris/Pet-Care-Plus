import { Tabs, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { backgroundColor: "#0a0a0a", borderTopColor: "rgba(255,255,255,0.06)" },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="pets/index" options={{ title: "Pets" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}
