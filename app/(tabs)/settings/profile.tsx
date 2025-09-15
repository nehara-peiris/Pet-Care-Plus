import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { auth, db } from "../../../lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useTheme } from "../../../contexts/ThemeContext";

const CLOUD_NAME = "dc55dtavq";
const UPLOAD_PRESET = "petcareplus_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const user = auth.currentUser;

  const [newName, setNewName] = useState(user?.displayName || "");
  const [newPhoto, setNewPhoto] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  // 🔹 Upload to Cloudinary
  const uploadImage = async (uri: string) => {
    let formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error("Image upload failed");
    }
  };

  // 🔹 Pick from gallery (using DocumentPicker)
  const pickProfileImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"], // only allow images
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0]; // first selected image
      if (!file) return;

      // Convert to correct format for FormData
      const uri = file.uri;
      const name = file.name || "upload.jpg";
      const type = file.mimeType || "image/jpeg";

      setUploading(true);
      let formData = new FormData();
      formData.append("file", {
        uri,
        type,
        name,
      } as any);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setNewPhoto(data.secure_url);
        Alert.alert("Success", "Image uploaded!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Take photo
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!result.canceled) {
      try {
        setUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri);
        setNewPhoto(uploadedUrl);
        Alert.alert("Success", "Image uploaded!");
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  // 🔹 Save updates
  const confirmProfileUpdate = async () => {
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhoto,
      });

      await updateDoc(doc(db, "users", user.uid), {
        displayName: newName,
        photoURL: newPhoto,
      });

      Alert.alert("Success", "Profile updated!");
      router.back();
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
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        Edit Profile
      </Text>

      {/* Profile Image */}
      <View style={styles.imageWrapper}>
        {uploading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : newPhoto ? (
          <Image
            source={{ uri: newPhoto }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        ) : (
          <Text style={{ color: theme === "dark" ? "#fff" : "#555" }}>
            No image selected
          </Text>
        )}
      </View>

      {/* Image Actions */}
      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.smallBtn} onPress={pickProfileImage}>
          <Text style={styles.smallBtnText}>📂 Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn} onPress={takePhoto}>
          <Text style={styles.smallBtnText}>📷 Camera</Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Display Name"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={newName}
        onChangeText={setNewName}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#007AFF" }]}
        onPress={confirmProfileUpdate}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#ccc" }]}
        onPress={() => router.back()}
      >
        <Text>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#000",
  },
  imageWrapper: {
    marginBottom: 15,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  smallBtn: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  smallBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
});
