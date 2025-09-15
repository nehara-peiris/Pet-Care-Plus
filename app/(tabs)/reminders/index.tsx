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
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type Reminder = {
  id: string;
  title: string;
  petId: string;
  date?: any;
  time?: string;
  type?: string;
  createdAt?: any;
};

export default function RemindersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Format Firestore Timestamps safely
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>📋 All Reminders</Text>

      <FlatList
        data={reminders}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.reminderCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/reminders/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text style={[styles.reminderTitle, { color: colors.text }]}>
              {item.title}
            </Text>

            {item.date && (
              <Text style={{ color: colors.icon, fontSize: 13 }}>
                📅 {formatDate(item.date)}
              </Text>
            )}
            {item.time && (
              <Text style={{ color: colors.icon, fontSize: 13 }}>⏰ {item.time}</Text>
            )}
            {item.type && (
              <Text style={{ color: colors.icon, fontSize: 13 }}>
                🏷️ Type: {item.type}
              </Text>
            )}
            {item.createdAt && (
              <Text style={{ color: colors.secondary, fontSize: 11, marginTop: 4 }}>
                🕒 Created {formatDate(item.createdAt, true)}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.icon }]}>
            No reminders yet. Add one!
          </Text>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/reminders/add")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  empty: { textAlign: "center", marginTop: 20, fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  reminderCard: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  reminderTitle: { fontWeight: "600", marginBottom: 6, fontSize: 16 },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
