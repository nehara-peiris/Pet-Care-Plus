import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";

function AddPet() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const save = async () => {
    try {
      // TODO: save to Firestore
      Alert.alert("Saved", "Pet created");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Add Pet</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Type (Dog/Cat…)" value={type} onChangeText={setType}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 }} />
      <Pressable onPress={save} style={{ backgroundColor: "#21706f", padding: 12, borderRadius: 8 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Save</Text>
      </Pressable>
    </View>
  );
}

export default AddPet