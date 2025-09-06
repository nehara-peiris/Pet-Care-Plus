import { View, Text } from "react-native";
import { auth } from "../../lib/firebase";

export default function Dashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-text-primary text-2xl font-bold">Dashboard</Text>
      <Text className="text-text-secondary mt-2">
        User: {auth.currentUser?.email || "Not logged in"}
      </Text>
    </View>
  );
}
