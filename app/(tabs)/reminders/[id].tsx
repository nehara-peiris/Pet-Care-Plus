import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import Toast from "react-native-toast-message";

export default function ReminderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [reminder, setReminder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const ref = doc(db, "reminders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setReminder({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "reminders", id));
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Reminder removed successfully.",
      });
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Could not delete reminder.",
      });
    }
  };



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
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
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        {reminder.title}
      </Text>
      {reminder.date && (
        <Text style={{ marginBottom: 6 }}>
          📅 {reminder.date.toDate().toLocaleString()}
        </Text>
      )}
      <Text style={{ marginBottom: 6 }}>🔁 Repeat: {reminder.type}</Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Edit"
          color="#0A84FF"
          onPress={() => router.push({ pathname: "/(tabs)/reminders/edit", params: { id: reminder.id } })}
        />
        <View style={{ marginTop: 10 }} />
        <Button title="Delete" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
