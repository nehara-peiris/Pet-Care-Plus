import { View, Text } from "react-native";

export default function Dashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-white text-2xl font-bold">Dashboard</Text>
      <Text className="text-neutral-400 mt-2">
        Weekly pet care summary and charts will appear here.
      </Text>
    </View>
  );
}
