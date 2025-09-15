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

  let trigger: NotificationTriggerInput;

  if (repeat === "daily") {
    trigger = {
      // daily repeat (every 24h)
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true,
    } as NotificationTriggerInput;
  } else if (repeat === "weekly") {
    trigger = {
      // weekly repeat (specific weekday + time)
      weekday: triggerDate.getDay() === 0 ? 7 : triggerDate.getDay(),
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      repeats: true,
    } as NotificationTriggerInput;
  } else {
    // once — cast Date to NotificationTriggerInput
    trigger = triggerDate as unknown as NotificationTriggerInput;
    
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