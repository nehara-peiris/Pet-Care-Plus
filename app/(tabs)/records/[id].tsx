import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

type Record = {
  id: string;
  title: string;
  petId: string;
  date?: any;
  fileUrl?: string;
  createdAt?: any;
};

export default function RecordDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchRecord = async () => {
      try {
        const ref = doc(db, "records", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setRecord({ id: snap.id, ...snap.data() } as Record);
        setLoading(false);
      } catch {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load record details."
        });
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "records", id));
      Toast.show({
        type: "success",
        text1: "Record deleted",
        text2: `${record?.title || "Record"} has been removed.`,
      });
      router.replace("/(tabs)/records");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: err.message || "Could not delete record.",
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!record) {
    Toast.show({
      type: "error",
      text1: "Not Found",
      text2: "This record does not exist or has been removed."
    });

    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>
          Record not found
        </Text>
      </View>
    );
  }


  const isImage = record.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPdf = record.fileUrl?.endsWith(".pdf");

  const formatDate = (ts: any, withTime = false) => {
    if (!ts) return "N/A";
    try {
      if (ts instanceof Timestamp) {
        return withTime
          ? ts.toDate().toLocaleString()
          : ts.toDate().toLocaleDateString();
      }
      if (ts instanceof Date)
        return withTime ? ts.toLocaleString() : ts.toLocaleDateString();
      return String(ts);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {record.title}
        </Text>

        {record.date && (
          <Text style={[styles.detail, { color: colors.icon }]}>
            📅 {formatDate(record.date)}
          </Text>
        )}
        {record.createdAt && (
          <Text style={[styles.subDetail, { color: colors.icon }]}>
            🕒 Created {formatDate(record.createdAt, true)}
          </Text>
        )}

        {record.fileUrl ? (
          <View style={{ marginTop: 15 }}>
            {isImage ? (
              <Image
                source={{ uri: record.fileUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <TouchableOpacity onPress={() => Linking.openURL(record.fileUrl!)}>
                <Text style={[styles.link, { color: colors.primary }]}>
                  {isPdf ? "📄 Open PDF" : "📎 Open File"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={[styles.subDetail, { color: colors.icon }]}>
            ❌ No file attached
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/records/edit",
              params: { id: record.id },
            })
          }
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "red" }]}
          onPress={handleDelete}
        >
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
  subDetail: { fontSize: 13, marginBottom: 6 },
  image: { width: "100%", height: 220, borderRadius: 10 },
  link: { fontSize: 16, textDecorationLine: "underline", marginTop: 12 },
  notFound: { fontSize: 18 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
