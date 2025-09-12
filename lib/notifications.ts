import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions (ask once)
export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission for notifications not granted!");
    return false;
  }

  // Android requires a channel for scheduled/local notifications
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
}

// Schedule a local notification
export async function scheduleReminderNotification(title: string, date: string, time: string) {
  if (!date || !time) return;

  const triggerDate = new Date(`${date}T${time}:00`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ Pet Reminder",
      body: title,
      sound: true,
    },
    trigger: {
      channelId: "default", // ✅ required on Android
      date: triggerDate,    // ✅ correct typing for SDK 50
    },
  });
}
