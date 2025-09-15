// app/(tabs)/records/add.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ Dark mode

export default function AddRecordScreen() {
  const router = useRouter();
  const { petId: fromPet } = useLocalSearchParams<{ petId?: string }>();
  const { theme } = useTheme(); // ✅

  const [petId, setPetId] = useState(fromPet || "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<any>(null);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);

  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const CLOUD_NAME = "dc55dtavq";
  const UPLOAD_PRESET = "petcareplus_unsigned";

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "pets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list: { id: string; name: string }[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, name: doc.data().name })
      );
      setPets(list);
    };
    fetchPets();
  }, []);

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

  const handleAddRecord = async () => {
    if (!title || !petId) {
      Alert.alert("Error", "Title and Pet are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      let fileUrl = "";
      if (file) {
        fileUrl = await uploadToCloudinary(file);
      }

      await addDoc(collection(db, "records"), {
        userId: user.uid,
        petId,
        title,
        date: Timestamp.fromDate(date),
        fileUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Record added!");
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
        Add Medical Record
      </Text>

      {/* Title */}
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            color: "#fff",
            borderColor: "#333",
          },
        ]}
        placeholder="Enter record title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={title}
        onChangeText={setTitle}
      />

      {/* Date Picker */}
      <View style={styles.inputBox}>
        <Text
          style={[styles.label, theme === "dark" && { color: "#fff" }]}
        >
          Date:
        </Text>
        <Button
          title={date.toLocaleDateString()}
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={() => setShowDatePicker(true)}
        />
      </View>
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
      <Button
        title="Pick File (Image/PDF)"
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
      ) : null}

      {/* Pet selector */}
      {!petId && (
        <>
          <Text
            style={[styles.label, theme === "dark" && { color: "#fff" }]}
          >
            Select Pet:
          </Text>
          {pets.map((pet) => (
            <Button
              key={pet.id}
              title={pet.name}
              onPress={() => setPetId(pet.id)}
              color={
                petId === pet.id
                  ? theme === "dark"
                    ? "#34C759"
                    : "green"
                  : theme === "dark"
                  ? "#555"
                  : "gray"
              }
            />
          ))}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Save Record"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={handleAddRecord}
        />
        <View style={{ marginTop: 10 }} />
        <Button
          title="Cancel"
          color={theme === "dark" ? "#555" : undefined}
          onPress={() => router.back()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputBox: { marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  label: { fontWeight: "600", marginBottom: 6, color: "#000" },
  fileName: { marginTop: 10, fontStyle: "italic", color: "gray" },
});
