import { View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";

function Settings() {
  const { user } = useAuth();
  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Settings</Text>
      <Text>Email: {user?.email}</Text>
      {/* add profile fields later */}
    </View>
  );
}

export default Settings
