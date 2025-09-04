import { View, Text, Pressable } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user, signOut } = useAuth();
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ marginBottom: 12 }}>{user?.email}</Text>
      <Pressable onPress={signOut} style={{ paddingHorizontal:16, paddingVertical:10, backgroundColor:"#ef4444", borderRadius:8 }}>
        <Text style={{ color:"#fff" }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
