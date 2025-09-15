// app/(tabs)/reminders/edit.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

export default function EditReminderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (!id) return;
    const loadReminder = async () => {
      const ref = doc(db, "reminders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const r = snap.data();
        setTitle(r.title || "");
        setType(r.type || "");
        if (r.date) {
          const jsDate = r.date.toDate();
          setDate(jsDate.toISOString().split("T")[0]);
          setTime(jsDate.toISOString().split("T")[1].slice(0, 5));
        }
      }
    };
    loadReminder();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      const reminderDate = new Date(`${date}T${time}:00`);
      const ref = doc(db, "reminders", id);
      await updateDoc(ref, {
        title,
        type,
        date: Timestamp.fromDate(reminderDate),
      });
      Alert.alert("Updated!", "Reminder updated successfully.");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "reminders", id));
      Alert.alert("Deleted!", "Reminder removed.");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>Edit Reminder</Text>

      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />
      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={date}
        onChangeText={setDate}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />
      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={time}
        onChangeText={setTime}
        placeholder="Time (HH:mm)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />
      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={type}
        onChangeText={setType}
        placeholder="Type (daily/special)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />

      <Button title="Update" color={theme === "dark" ? "#0A84FF" : undefined} onPress={handleUpdate} />
      <View style={{ marginTop: 12 }} />
      <Button title="Delete Reminder" color="red" onPress={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  inputDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    color: "#fff",
  },
});
