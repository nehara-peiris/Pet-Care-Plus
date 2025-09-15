import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function ReminderDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reminder, setReminder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadReminder = async () => {
      try {
        const ref = doc(db, "reminders", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setReminder({ id: snap.id, ...snap.data() });
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
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "reminders", id));
            router.replace("/(tabs)/reminders");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const formatDate = (val: any) => {
    if (!val) return "N/A";
    try {
      if (val instanceof Timestamp) return val.toDate().toLocaleString();
      if (val.toDate) return val.toDate().toLocaleString();
      if (val instanceof Date) return val.toLocaleString();
      return String(val);
    } catch {
      return String(val);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Reminder not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{reminder.title}</Text>

        {reminder.date && <Text style={[styles.detail, { color: colors.icon }]}>📅 {formatDate(reminder.date)}</Text>}
        {reminder.time && <Text style={[styles.detail, { color: colors.icon }]}>⏰ {reminder.time}</Text>}
        <Text style={[styles.detail, { color: colors.icon }]}>📌 Type: {reminder.type || "N/A"}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/(tabs)/reminders/edit?id=${reminder.id}`)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: "red" }]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  detail: { fontSize: 15, marginBottom: 6 },
  text: { fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  actions: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  btn: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, gap: 6 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
