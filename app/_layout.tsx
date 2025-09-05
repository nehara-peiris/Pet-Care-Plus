import { Tabs } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import { AuthProvider } from "../context/AuthContext";

export default function TabsLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Tabs>
          <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="pets/index" options={{ title: "Pets" }} />
          <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
        </Tabs>
      </AuthProvider>
    </Provider>
  );
}
