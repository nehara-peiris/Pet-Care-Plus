import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function ReminderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reminder, setReminder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadReminder = async () => {
      const ref = doc(db, "reminders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setReminder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={styles.center}>
        <Text>Reminder not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{reminder.title}</Text>
      {reminder.date ? <Text>📅 Date: {reminder.date}</Text> : null}
      {reminder.time ? <Text>⏰ Time: {reminder.time}</Text> : null}
      <Text>📌 Type: {reminder.type}</Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Edit Reminder"
          onPress={() => router.push(`/(tabs)/reminders/edit?id=${reminder.id}`)}
        />
        <View style={{ marginTop: 10 }} />
        <Button title="Delete Reminder" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
