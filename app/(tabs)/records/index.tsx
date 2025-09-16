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

type Record = {
  id: string;
  title: string;
  petId: string;
  date?: any;       // Firestore Timestamp
  fileUrl?: string;
  createdAt?: any;  // Firestore Timestamp
};

export default function RecordsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const recordsRef = collection(db, "records");
    const recordsQuery = query(recordsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      const list: Record[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Record));
      setRecords(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>📂 Medical Records</Text>

      <FlatList
        data={records}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.recordCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({ pathname: "/(tabs)/records/[id]", params: { id: item.id } })
            }
          >
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

            {item.date && (
              <Text style={{ color: colors.icon, fontSize: 13 }}>
                📅 {formatDate(item.date)}
              </Text>
            )}

            {item.createdAt && (
              <Text style={{ color: colors.icon, fontSize: 11, marginTop: 2 }}>
                🕒 {formatDate(item.createdAt, true)}
              </Text>
            )}

            <Text
              style={{
                marginTop: 6,
                color: item.fileUrl ? colors.primary : "gray",
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              {item.fileUrl ? "📎 File Attached" : "❌ No File"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.icon }]}>
            No records yet. Add one!
          </Text>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/records/add")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  empty: { textAlign: "center", marginTop: 20, fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  recordCard: {
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
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },

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
