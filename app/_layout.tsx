import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { useEffect } from "react";
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "../lib/notifications";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function RootLayoutNav() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            savePushToken(token);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> {/* Welcome */}
      <Stack.Screen name="(auth)" /> {/* Auth screens */}
      <Stack.Screen name="(tabs)" /> {/* Dashboard + others */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
