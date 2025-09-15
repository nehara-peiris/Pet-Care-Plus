import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";

const CLOUD_NAME = "dc55dtavq";
const UPLOAD_PRESET = "petcareplus_unsigned";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export default function AddPetScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Pick from gallery (DocumentPicker)
  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      await uploadImage(file.uri, file.name || "upload.jpg", file.mimeType || "image/jpeg");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ✅ Take a photo
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

  // ✅ Upload to Cloudinary
  const uploadImage = async (uri: string, name: string, type: string) => {
    try {
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
        setImageUrl(data.secure_url);
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

  // ✅ Save pet
  const handleAddPet = async () => {
    if (!name || !type) {
      Alert.alert("Error", "Name and Type are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to add a pet.");
        return;
      }

      await addDoc(collection(db, "pets"), {
        userId: user.uid,
        name,
        type,
        age,
        breed,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", `${name} has been added!`);
      router.replace("/(tabs)/dashboard");
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
        Add Pet
      </Text>

      {/* Image Upload Section */}
      <TouchableOpacity style={styles.imagePicker}>
        {uploading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        ) : (
          <Text style={{ color: theme === "dark" ? "#fff" : "#555" }}>
            No image selected
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.imageButtons}>
        <Button title="Pick from Gallery" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>

      {/* Inputs */}
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Pet Name"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Type (Dog, Cat, etc.)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Age"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={[
          styles.input,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
        placeholder="Breed (optional)"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={breed}
        onChangeText={setBreed}
      />

      <Button
        title="Save Pet"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={handleAddPet}
      />
      <View style={{ marginTop: 10 }} />
      <Button
        title="Cancel"
        color={theme === "dark" ? "#555" : undefined}
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  imagePicker: {
    alignSelf: "center",
    marginBottom: 10,
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
    marginBottom: 20,
  },
});
