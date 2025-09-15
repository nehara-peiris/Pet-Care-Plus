// app/(tabs)/reminders/[id].tsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

export default function ReminderDetailsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reminder, setReminder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadReminder = async () => {
      try {
        const ref = doc(db, "reminders", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setReminder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error loading reminder:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReminder();
  }, [id]);

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

  const formatDate = (val: any) => {
    if (!val) return "N/A";
    try {
      if (val instanceof Timestamp) return val.toDate().toLocaleString();
      if (val.toDate) return val.toDate().toLocaleString(); // Firestore object
      if (val instanceof Date) return val.toLocaleString();
      return String(val);
    } catch {
      return String(val);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#0A84FF" : "blue"} />
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <Text style={[{ color: theme === "dark" ? "#fff" : "#000" }]}>
          Reminder not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
        {reminder.title}
      </Text>

      {reminder.date && (
        <Text style={[styles.detail, theme === "dark" && { color: "#bbb" }]}>
          📅 Date: {formatDate(reminder.date)}
        </Text>
      )}
      {reminder.time && (
        <Text style={[styles.detail, theme === "dark" && { color: "#bbb" }]}>
          ⏰ Time: {reminder.time}
        </Text>
      )}
      <Text style={[styles.detail, theme === "dark" && { color: "#bbb" }]}>
        📌 Type: {reminder.type}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Edit Reminder"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={() => router.push(`/(tabs)/reminders/edit?id=${reminder.id}`)}
        />
        <View style={{ marginTop: 10 }} />
        <Button
          title="Delete Reminder"
          color="red"
          onPress={handleDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  detail: { fontSize: 16, marginBottom: 8, color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
