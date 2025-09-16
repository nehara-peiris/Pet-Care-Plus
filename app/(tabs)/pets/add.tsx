import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const CLOUD_NAME = "dc55dtavq";
const UPLOAD_PRESET = "petcareplus_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export default function AddPetScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Pick from gallery
  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      await uploadImage(file.uri, file.name || "upload.jpg", file.mimeType || "image/jpeg");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Image Error",
        text2: err.message || "Could not pick image."
      });
    }
  };

  // Take photo
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const file = result.assets[0];
      await uploadImage(file.uri, "camera.jpg", "image/jpeg");
    }
  };

  // Upload to Cloudinary
  const uploadImage = async (uri: string, name: string, type: string) => {
    try {
      setUploading(true);
      let formData = new FormData();
      formData.append("file", { uri, type, name } as any);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else throw new Error("Upload failed");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: err.message || "Could not upload image."
      });
    } finally {
      setUploading(false);
    }
  };

  // Save pet
  const handleAddPet = async () => {
    if (!name || !type) {
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Name and Type are required!"
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Not Logged In",
        text2: "You must be logged in to add a pet."
      });
      return;
    }

    try {
      await addDoc(collection(db, "pets"), {
        userId: user.uid,
        name,
        type,
        age,
        breed,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Pet Added",
        text2: `${name} has been added successfully.`
      });

      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Save Error",
        text2: err.message || "Could not save pet."
      });
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>🐾 Add New Pet</Text>

      {/* Form Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Avatar Image Picker */}
        <View style={styles.imageWrapper}>
          {uploading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <Ionicons name="paw-outline" size={48} color={colors.icon} />
          )}

          {/* Overlay actions */}
          <View style={styles.imageActions}>
            <TouchableOpacity
              onPress={pickImage}
              style={[styles.iconBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="image-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs */}
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Pet Name"
          placeholderTextColor={colors.icon}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Type (Dog, Cat, etc.)"
          placeholderTextColor={colors.icon}
          value={type}
          onChangeText={setType}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Age"
          placeholderTextColor={colors.icon}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Breed (optional)"
          placeholderTextColor={colors.icon}
          value={breed}
          onChangeText={setBreed}
        />
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleAddPet}>
        <Text style={styles.btnText}>💾 Save Pet</Text>
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
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  imageWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imageActions: {
    position: "absolute",
    bottom: -10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  iconBtn: {
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 20,
    elevation: 2,
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
