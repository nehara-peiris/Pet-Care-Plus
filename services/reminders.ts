// Placeholder for local notifications scheduling
// Later: use 'expo-notifications' with permissions
export async function scheduleReminder(opts: {
  title: string;
  body: string;
  fireDate: Date;
  id?: string;
}) {
  // return Notifications.scheduleNotificationAsync({...})
  return { id: opts.id ?? `rem-${Date.now()}` };
}
