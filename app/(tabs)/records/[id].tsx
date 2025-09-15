// app/(tabs)/records/[id].tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  Linking,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ Dark mode

type Record = {
  id: string;
  title: string;
  petId: string;
  date?: any;       // Firestore Timestamp
  fileUrl?: string;
  createdAt?: any;  // Firestore Timestamp
};

export default function RecordDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme(); // ✅ Theme

  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      try {
        const ref = doc(db, "records", id);
        const snap = await getDoc(ref);
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

  const handleDelete = async () => {
    if (!id) return;

    Alert.alert("Delete Record", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "records", id));
            Alert.alert("Deleted!", "Record removed successfully.");
            router.replace("/(tabs)/records");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#fff" : "blue"} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <Text style={[styles.notFound, theme === "dark" && { color: "#fff" }]}>
          Record not found
        </Text>
        <Button
          title="Back"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={() => router.back()}
        />
      </View>
    );
  }

  // ✅ Detect if file is an image or PDF
  const isImage = record.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPdf = record.fileUrl?.endsWith(".pdf");

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
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        {record.title}
      </Text>

      {record.date ? (
        <Text style={theme === "dark" && { color: "#bbb" }}>
          📅 Date: {formatDate(record.date)}
        </Text>
      ) : null}

      {record.createdAt ? (
        <Text style={theme === "dark" && { color: "#777" }}>
          🕒 Created: {formatDate(record.createdAt, true)}
        </Text>
      ) : null}

      {record.fileUrl ? (
        <View style={{ marginTop: 20 }}>
          {isImage ? (
            <Image
              source={{ uri: record.fileUrl }}
              style={{ width: "100%", height: 300, borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={[
                styles.link,
                { color: theme === "dark" ? "#0A84FF" : "blue" },
              ]}
              onPress={() => Linking.openURL(record.fileUrl!)}
            >
              {isPdf ? "📄 Open PDF" : "📎 Open File"}
            </Text>
          )}
        </View>
      ) : (
        <Text style={theme === "dark" && { color: "#aaa" }}>No file attached</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Edit Record"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={() =>
            router.push({ pathname: "/(tabs)/records/edit", params: { id: record.id } })
          }
        />
        <View style={{ marginTop: 10 }} />
        <Button
          title="Delete Record"
          color="red"
          onPress={handleDelete}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  link: { marginTop: 12, textDecorationLine: "underline" },
  notFound: { fontSize: 18, marginBottom: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
