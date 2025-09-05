import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </Provider>
  );
}
