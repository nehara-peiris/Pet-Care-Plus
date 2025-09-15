// app/(tabs)/pets/add.tsx
import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

export default function AddPetScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAddPet = async () => {
    if (!name || !type) {
      Alert.alert("Error", "Name and Type are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to add a pet.");
        return;
      }

      await addDoc(collection(db, "pets"), {
        userId: user.uid,
        name,
        type,
        age,
        breed,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", `${name} has been added!`);
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        Add Pet
      </Text>

      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Pet Name"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Type (Dog, Cat, etc.)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Age"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Breed (optional)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={breed}
        onChangeText={setBreed}
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Image URL (optional)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      <Button
        title="Save Pet"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={handleAddPet}
      />
      <View style={{ marginTop: 10 }} />
      <Button
        title="Cancel"
        color={theme === "dark" ? "#555" : undefined}
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
});
