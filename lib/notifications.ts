// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 🔹 Schedule reminder (supports once/daily/weekly)
export async function scheduleReminderNotification(
  title: string,
  date: string,
  time: string,
  repeat: "once" | "daily" | "weekly" = "once"
) {
  const triggerDate = new Date(`${date}T${time}:00`);

  let trigger: any = triggerDate; // default once

  if (repeat === "daily") {
    trigger = {
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true,
    };
  } else if (repeat === "weekly") {
    trigger = {
      weekday: triggerDate.getDay() + 1,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true,
    };
  }

  await Notifications.scheduleNotificationAsync({
    content: { title: "🐾 Reminder", body: title },
    trigger,
  });
}
