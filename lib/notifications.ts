// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getMessaging, getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function ensurePermissionsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== "granted") {
    const ask = await Notifications.requestPermissionsAsync();
    if (ask.status !== "granted") {
      throw new Error("Notification permission denied");
    }
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleLocal(when: Date, title: string, body: string) {
  await ensurePermissionsAsync();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      date: when,
    },
  });
}

export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowProvisional: true,
    },
  });
}

export async function registerForPushNotificationsAsync() {
  let token;
  const messaging = getMessaging();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (await allowsNotificationsAsync()) {
    try {
      const vapidKey = process.env.EXPO_PUBLIC_FB_VAPID_KEY;
      token = await getToken(messaging, { vapidKey });
    } catch (e) {
      console.error("Failed to get push token for messaging", e);
    }
  } else {
    const { status } = await requestPermissionsAsync();
    if (status === "granted") {
      try {
        const vapidKey = process.env.EXPO_PUBLIC_FB_VAPID_KEY;
        token = await getToken(messaging, { vapidKey });
      } catch (e) {
        console.error("Failed to get push token for messaging", e);
      }
    } else {
      alert("Failed to get push token for push notification!");
      return;
    }
  }

  return token;
}

export async function savePushToken(token: string) {
  if (!auth.currentUser) {
    return;
  }
  const userId = auth.currentUser.uid;
  const tokenRef = doc(db, "users", userId, "pushTokens", token);
  await setDoc(tokenRef, { token });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
