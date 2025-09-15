// app/(tabs)/records/edit.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

export default function EditRecordScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<any>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string>("");

  // Replace with your Cloudinary details
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
        setDate(r.date?.toDate().toISOString().split("T")[0] || ""); // YYYY-MM-DD
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

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick file");
    }
  };

  // Upload to Cloudinary
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
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    if (json.secure_url) {
      return json.secure_url;
    } else {
      throw new Error("Cloudinary upload failed");
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    try {
      let fileUrl = currentFileUrl;
      if (file) {
        fileUrl = await uploadToCloudinary(file);
      }

      const ref = doc(db, "records", id);
      await updateDoc(ref, {
        title,
        date: date ? new Date(date) : null,
        fileUrl,
      });

      Alert.alert("Updated!", "Record updated successfully.");
      router.replace("/(tabs)/records");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Text
        style={[styles.heading, theme === "dark" && { color: "#fff" }]}
      >
        Edit Record
      </Text>

      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            color: "#fff",
            borderColor: "#333",
          },
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Record Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />

      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            color: "#fff",
            borderColor: "#333",
          },
        ]}
        value={date}
        onChangeText={setDate}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />

      <Button
        title="Pick New File"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={pickFile}
      />
      {file ? (
        <Text
          style={[
            styles.fileName,
            theme === "dark" && { color: "#aaa" },
          ]}
        >
          📎 {file.name}
        </Text>
      ) : currentFileUrl ? (
        <Text
          style={[
            styles.fileName,
            theme === "dark" && { color: "#aaa" },
          ]}
        >
          📂 Existing file attached
        </Text>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Update"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={handleUpdate}
        />
        <View style={{ marginTop: 12 }} />
        <Button
          title="Cancel"
          color={theme === "dark" ? "#555" : undefined}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  fileName: { marginTop: 10, fontStyle: "italic", color: "gray" },
});
