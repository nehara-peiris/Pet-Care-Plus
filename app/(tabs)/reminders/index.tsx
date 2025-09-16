import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

type Reminder = {
  id: string;
  title: string;
  date?: any;
  type: string;
};

export default function RemindersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, "reminders");
    const q = query(ref, where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: Reminder[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}
    >
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
        🔔 My Reminders
      </Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/(tabs)/reminders/add")}
      >
        <Text style={styles.addBtnText}>+ Add Reminder</Text>
      </TouchableOpacity>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              theme === "dark" && { backgroundColor: "#1e1e1e", borderColor: "#333" },
            ]}
            onPress={() =>
              router.push({ pathname: "/(tabs)/reminders/[id]", params: { id: item.id } })
            }
          >
            <Text
              style={[styles.title, theme === "dark" && { color: "#fff" }]}
            >
              {item.title}
            </Text>
            {item.date && (
              <Text style={{ color: theme === "dark" ? "#aaa" : "#333" }}>
                {item.date.toDate().toLocaleString()}
              </Text>
            )}
            <Text style={{ color: "#0A84FF" }}>Repeat: {item.type}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reminders yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  addBtn: {
    backgroundColor: "#0A84FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 20, color: "gray" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
