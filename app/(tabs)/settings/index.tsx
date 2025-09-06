import { View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";

function Settings() {
  const { user } = useAuth();
  return (
    <View className="flex-1 p-4 gap-2 bg-primary">
      <Text className="text-2xl font-bold text-text-primary">Settings</Text>
      <Text className="text-text-secondary">Email: {user?.email}</Text>
      {/* add profile fields later */}
    </View>
  );
}

export default Settings
