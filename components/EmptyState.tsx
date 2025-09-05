import { View, Text } from 'react-native';

type EmptyStateProps = {
  message: string;
};

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-white">{message}</Text>
    </View>
  );
}
