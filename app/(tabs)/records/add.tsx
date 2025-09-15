import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
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
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function AddRecordScreen() {
  const router = useRouter();
  const { petId: fromPet } = useLocalSearchParams<{ petId?: string }>();
  const { colors } = useTheme();

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
      snapshot.forEach((doc) => list.push({ id: doc.id, name: doc.data().name }));
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

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (json.secure_url) return json.secure_url;
    throw new Error("Cloudinary upload failed");
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>➕ Add Medical Record</Text>

      {/* Card wrapper */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Title */}
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter record title"
          placeholderTextColor={colors.icon}
          value={title}
          onChangeText={setTitle}
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
          <Text style={{ color: "#fff", fontWeight: "bold", marginLeft: 6 }}>
            Pick File (Image/PDF)
          </Text>
        </TouchableOpacity>
        {file && (
          <Text style={[styles.fileName, { color: colors.icon }]}>📎 {file.name}</Text>
        )}

        {/* Pet Selector */}
        {!fromPet && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { color: colors.text }]}>Select Pet:</Text>
            <View style={styles.petRow}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    {
                      backgroundColor: petId === pet.id ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setPetId(pet.id)}
                >
                  <Text style={{ color: petId === pet.id ? "#fff" : colors.text, fontWeight: "600" }}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleAddRecord}>
        <Text style={styles.btnText}>💾 Save Record</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={() => router.back()}>
        <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
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
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 10,
  },
  fileName: { marginTop: 6, fontStyle: "italic" },
  label: { fontSize: 16, marginBottom: 6, fontWeight: "600" },
  petRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  petOption: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
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
