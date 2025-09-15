// app/(tabs)/records/index.tsx
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
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ Dark mode support

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
  const { theme } = useTheme(); // ✅ Theme hook
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

  if (loading) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#fff" : "blue"} />
      </View>
    );
  }

  // ✅ Helper: format Firestore Timestamp safely
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
        📂 All Records
      </Text>

      <Button
        title="➕ Add Record"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={() => router.push("/(tabs)/records/add")}
      />

      {records.length === 0 ? (
        <Text style={[styles.empty, theme === "dark" && { color: "#aaa" }]}>
          No records yet. Add one!
        </Text>
      ) : (
        records.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={[
              styles.recordCard,
              theme === "dark" && {
                backgroundColor: "#1e1e1e",
                borderColor: "#333",
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/records/[id]",
                params: { id: record.id },
              })
            }
          >
            <Text
              style={[styles.recordTitle, theme === "dark" && { color: "#fff" }]}
            >
              {record.title}
            </Text>

            {record.date ? (
              <Text style={theme === "dark" && { color: "#bbb" }}>
                📅 {formatDate(record.date)}
              </Text>
            ) : null}

            {record.createdAt ? (
              <Text style={theme === "dark" && { color: "#777" }}>
                Created: {formatDate(record.createdAt, true)}
              </Text>
            ) : null}

            {record.fileUrl ? (
              <Text style={{ color: theme === "dark" ? "#0A84FF" : "blue" }}>
                📎 File Attached
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
  recordCard: {
    padding: 14,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  recordTitle: { fontWeight: "bold", marginBottom: 4, fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
