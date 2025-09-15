import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function EditRecordScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [file, setFile] = useState<any>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cloudinary
  const CLOUD_NAME = "dc55dtavq";
  const UPLOAD_PRESET = "petcareplus_unsigned";

  useEffect(() => {
    if (!id) return;
    const loadRecord = async () => {
      const ref = doc(db, "records", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const r = snap.data();
        setTitle(r.title || "");
        if (r.date instanceof Timestamp) setDate(r.date.toDate());
        setCurrentFileUrl(r.fileUrl || "");
      }
    };
    loadRecord();
  }, [id]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setFile(result.assets[0]);
    } catch {
      Alert.alert("Error", "Could not pick file");
    }
  };

  const uploadToCloudinary = async (file: any) => {
    const data = new FormData();
    data.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name || "upload",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: data }
    );

    const json = await res.json();
    if (json.secure_url) return json.secure_url;
    throw new Error("Cloudinary upload failed");
  };

  const handleUpdate = async () => {
    if (!id) return;
    try {
      let fileUrl = currentFileUrl;
      if (file) fileUrl = await uploadToCloudinary(file);

      const ref = doc(db, "records", id);
      await updateDoc(ref, {
        title,
        date: Timestamp.fromDate(date),
        fileUrl,
      });

      Alert.alert("Updated!", "Record updated successfully.");
      router.replace("/(tabs)/records");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>✏️ Edit Record</Text>

      {/* Card wrapper */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Title */}
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Record Title"
          placeholderTextColor={colors.icon}
        />

        {/* Date Picker */}
        <TouchableOpacity
          style={[styles.dateBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.icon} />
          <Text style={{ color: colors.text, marginLeft: 8 }}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* File Upload */}
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
          onPress={pickFile}
        >
          <Ionicons name="attach-outline" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 6 }}>Pick New File</Text>
        </TouchableOpacity>
        {file ? (
          <Text style={[styles.fileName, { color: colors.icon }]}>📎 {file.name}</Text>
        ) : currentFileUrl ? (
          <Text style={[styles.fileName, { color: colors.icon }]}>📂 Existing file attached</Text>
        ) : null}
      </View>

      {/* Actions */}
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleUpdate}>
        <Text style={styles.btnText}>💾 Update Record</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={() => router.back()}>
        <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fileName: { marginTop: 5, fontStyle: "italic" },
  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  btnText: { fontWeight: "bold", fontSize: 16, color: "#fff" },
});
