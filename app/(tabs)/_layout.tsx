// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

function TabsLayout() {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="pets/index" options={{ title: "Pets" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}

export default TabsLayout