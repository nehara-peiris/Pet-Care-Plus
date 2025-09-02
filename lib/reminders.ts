import * as Notifications from "expo-notifications";

export async function scheduleReminder(whenISO: string, title: string, body?: string) {
  const trigger = new Date(whenISO);
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}
