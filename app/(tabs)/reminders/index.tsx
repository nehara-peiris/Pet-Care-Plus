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
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type Reminder = {
  id: string;
  title: string;
  petId: string;
  date?: string;
  time?: string;
  type?: string;
};

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const remindersRef = collection(db, "reminders");
    const remindersQuery = query(remindersRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Reminder)
      );
      setReminders(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📋 All Reminders</Text>

      <Button
        title="➕ Add Reminder"
        onPress={() => router.push("/(tabs)/reminders/add")}
      />

      {reminders.length === 0 ? (
        <Text style={styles.empty}>No reminders yet. Add one!</Text>
      ) : (
        reminders.map((reminder) => (
          <TouchableOpacity
            key={reminder.id}
            style={styles.reminderCard}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/reminders/[id]",
                params: { id: reminder.id },
              })
            }
          >
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            {reminder.date ? <Text>📅 {reminder.date}</Text> : null}
            {reminder.time ? <Text>⏰ {reminder.time}</Text> : null}
            <Text>📌 {reminder.type}</Text>
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
  editHint: { marginTop: 6, color: "gray", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
