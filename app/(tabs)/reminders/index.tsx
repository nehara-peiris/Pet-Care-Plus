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
import { Ionicons } from "@expo/vector-icons";

type Reminder = {
  id: string;
  title: string;
  date?: any;
  type: string;
};

export default function RemindersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, "reminders");
    const q = query(ref, where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list: Reminder[] = [];
      snap.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Reminder)
      );
      setReminders(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>🔔 My Reminders</Text>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/reminders/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.date && (
              <Text style={{ color: colors.icon }}>
                {item.date.toDate().toLocaleString()}
              </Text>
            )}
            <Text style={{ color: colors.primary }}>Repeat: {item.type}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.icon }]}>
            No reminders yet
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
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },

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
