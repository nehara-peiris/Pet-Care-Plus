// app/(tabs)/reminders/index.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ Dark mode hook

type Reminder = {
  id: string;
  title: string;
  petId: string;
  date?: any;       // Firestore Timestamp
  time?: string;
  type?: string;
  createdAt?: any;  // Firestore Timestamp
};

export default function RemindersScreen() {
  const router = useRouter();
  const { theme } = useTheme(); // ✅ Dark mode context
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const remindersRef = collection(db, "reminders");
    const remindersQuery = query(remindersRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#fff" : "blue"} />
      </View>
    );
  }

  // ✅ Safe timestamp formatting
  const formatDate = (ts: any, withTime = false) => {
    if (!ts) return "N/A";
    try {
      if (ts instanceof Timestamp) {
        return withTime
          ? ts.toDate().toLocaleString()
          : ts.toDate().toLocaleDateString();
      }
      if (ts instanceof Date) {
        return withTime ? ts.toLocaleString() : ts.toLocaleDateString();
      }
      return String(ts);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
        📋 All Reminders
      </Text>

      <Button
        title="➕ Add Reminder"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={() => router.push("/(tabs)/reminders/add")}
      />

      {reminders.length === 0 ? (
        <Text style={[styles.empty, theme === "dark" && { color: "#aaa" }]}>
          No reminders yet. Add one!
        </Text>
      ) : (
        reminders.map((reminder) => (
          <TouchableOpacity
            key={reminder.id}
            style={[
              styles.reminderCard,
              theme === "dark" && {
                backgroundColor: "#1e1e1e",
                borderColor: "#333",
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/reminders/[id]",
                params: { id: reminder.id },
              })
            }
          >
            <Text
              style={[styles.reminderTitle, theme === "dark" && { color: "#fff" }]}
            >
              {reminder.title}
            </Text>

            {reminder.date ? (
              <Text style={theme === "dark" && { color: "#bbb" }}>
                📅 {formatDate(reminder.date)}
              </Text>
            ) : null}

            {reminder.time ? (
              <Text style={theme === "dark" && { color: "#bbb" }}>
                ⏰ {reminder.time}
              </Text>
            ) : null}

            <Text style={theme === "dark" && { color: "#bbb" }}>
              Type: {reminder.type}
            </Text>

            {reminder.createdAt ? (
              <Text style={theme === "dark" && { color: "#777" }}>
                Created: {formatDate(reminder.createdAt, true)}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  empty: { textAlign: "center", marginTop: 20, color: "gray" },
  reminderCard: {
    padding: 14,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  reminderTitle: { fontWeight: "bold", marginBottom: 4, fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
