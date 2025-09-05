import { View, Text } from 'react-native';
import { Reminder } from '../types/reminder';

type ReminderItemProps = {
  reminder: Reminder;
};

export default function ReminderItem({ reminder }: ReminderItemProps) {
  return (
    <View className="bg-neutral-800 p-4 rounded-2xl mb-2">
      <Text className="text-white text-lg">{reminder.title}</Text>
      <Text className="text-gray-400">{new Date(reminder.date).toLocaleDateString()}</Text>
      <Text className="text-gray-400">{reminder.type}</Text>
    </View>
  );
}
