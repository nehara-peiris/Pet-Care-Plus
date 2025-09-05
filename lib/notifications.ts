// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensurePermission() {
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

export async function scheduleLocal(when: number, title: string, body: string) {
  await ensurePermission();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: new Date(when), 
  });
}
