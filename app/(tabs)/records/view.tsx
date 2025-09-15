import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Linking } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Timestamp } from "firebase/firestore";

type Record = {
  id: string;
  title: string;
  date?: Timestamp | string;
  fileUrl?: string;
  createdAt?: Timestamp | string;
};

export default function ViewRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (ts?: Timestamp | string, withTime = false) => {
    if (!ts) return "N/A";
    try {
      if (ts instanceof Timestamp) {
        return withTime
          ? ts.toDate().toLocaleString()
          : ts.toDate().toLocaleDateString();
      }
      if (typeof ts === "string") {
        const d = new Date(ts);
        return withTime ? d.toLocaleString() : d.toLocaleDateString();
      }
      return String(ts);
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        const docRef = doc(db, "records", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setRecord({ id: snap.id, ...snap.data() } as Record);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching record:", err);
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text>Record not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{record.title}</Text>
      <Text>📅 Date: {formatDate(record.date)}</Text>
      <Text>🕒 Created: {formatDate(record.createdAt, true)}</Text>

      {record.fileUrl ? (
        <Button
          title="Open File"
          onPress={() => Linking.openURL(record.fileUrl!)}
        />
      ) : (
        <Text style={{ marginTop: 10 }}>No file attached</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
});
