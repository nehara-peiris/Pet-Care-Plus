// app/(tabs)/reminders/edit.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function EditReminderScreen() {
  const router = useRouter();
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
        setDate(r.date || "");
        setTime(r.time || "");
        setType(r.type || "");
      }
    };
    loadReminder();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      const ref = doc(db, "reminders", id);
      await updateDoc(ref, { title, date, time, type });
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
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Reminder</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Date (YYYY-MM-DD)"
      />
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Time (HH:mm)"
      />
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="Type (daily/special)"
      />

      <Button title="Update" onPress={handleUpdate} />
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
  },
});
