// lib/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { NotificationTriggerInput } from "expo-notifications";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type RepeatOption = "once" | "daily" | "weekly";

// Request permission (call once on app startup)
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted!");
  }
}

// Schedule reminder
export async function scheduleReminderNotification(
  title: string,
  date: string,
  time: string,
  repeat: RepeatOption = "once"
): Promise<string> {
  const triggerDate = new Date(`${date}T${time}:00`);

  let trigger: Notifications.NotificationTriggerInput;

  if (repeat === "daily") {
    // Repeats daily at the specified hour and minute.
    trigger = {
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true, // This is correct for daily repeats
    };
  } else if (repeat === "weekly") {
    // Repeats weekly on the specified weekday, at the specified time.
    // weekday is 1-7 (Sun-Sat)
    trigger = {
      weekday: triggerDate.getDay() + 1,
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true, // This is correct for weekly repeats
    };
  } else {
    // A one-time trigger. Using a Date object directly is deprecated.
    // We use a DateTriggerInput object instead.
    trigger = {
      date: triggerDate,
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🐾 Reminder",
      body: title,
      sound: Platform.OS === "ios" ? "default" : undefined,
    },
    trigger,
  });

  return id;
}

// Cancel a specific scheduled notification
export async function cancelReminderNotification(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (err) {
    console.error("Failed to cancel notification:", err);
  }
}

// Cancel all scheduled notifications
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}