import { useLocalSearchParams, Link } from "expo-router";
import { FlatList, View } from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import ReminderItem from "../../../../components/ReminderItem";
import EmptyState from "../../../../components/EmptyState";

export default function PetReminders() {
  const { id } = useLocalSearchParams();
  const reminders = useSelector((s: RootState) =>
    s.reminders.items.filter((r) => r.petId === id)
  );

  if (!reminders.length) return <EmptyState message="No reminders set." />;

  return (
    <View className="flex-1 bg-black p-4">
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReminderItem reminder={item} />}
      />
      <Link href={`/ (tabs)/pets/${id}/addReminder`} className="bg-teal-500 p-3 rounded-2xl text-center text-black mt-4">
        + Add Reminder
      </Link>
    </View>
  );
}
