import * as Notifications from "expo-notifications";

export default function Home() {
  async function testNotif() {
    await Notifications.scheduleNotificationAsync({
      content: { title: "Test Reminder", body: "This is PetCarePlus 🐾" },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,            // fire in 5 seconds
        repeats: false,
      },
    });
  }

}
