import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Text } from "react-native";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#1E1E1E" },
        tabBarActiveTintColor: "#389AFE",
        tabBarInactiveTintColor: "#A0A0A0",
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="pets/index" options={{ title: "Pets" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}