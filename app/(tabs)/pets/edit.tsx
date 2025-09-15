// app/(tabs)/pets/edit.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPet = async () => {
      try {
        const docRef = doc(db, "pets", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const pet = snap.data();
          setName(pet.name || "");
          setType(pet.type || "");
          setAge(pet.age || "");
          setBreed(pet.breed || "");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pet:", err);
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    if (!name || !type) {
      Alert.alert("Error", "Name and Type are required!");
      return;
    }

    try {
      const docRef = doc(db, "pets", id);
      await updateDoc(docRef, {
        name,
        type,
        age,
        breed,
      });
      Alert.alert("Success", "Pet updated successfully!");
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        Edit Pet
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

      <Button
        title="Update Pet"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={handleUpdate}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
