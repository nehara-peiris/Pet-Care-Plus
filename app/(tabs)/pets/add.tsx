import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";

export default function AddPet() {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const canSubmit = useMemo(
    () => name.trim().length > 0 && species.trim().length > 0 && !!avatar && !busy,
    [name, species, avatar, busy]
  );

  const pickImage = async () => {
    // Ask for permission if needed
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      return Alert.alert("Permission needed", "Please allow photo library access.");
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      return Alert.alert("Incomplete", "Please fill all fields and pick an image.");
    }
    try {
      setBusy(true);

      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }

      // Upload image
      const fileRef = ref(storage, `pets/${user.uid}/${Date.now()}.jpg`);
      const img = await fetch(avatar!);
      const blob = await img.blob();
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      // Save document
      await addDoc(collection(db, "users", user.uid, "pets"), {
        name: name.trim(),
        species: species.trim(),
        avatarUrl: url,
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save pet");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">Add Pet</Text>

      <Pressable
        onPress={pickImage}
        className="items-center justify-center bg-gray-100 h-40 rounded-xl mb-4"
      >
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-40 h-40 rounded-xl" />
        ) : (
          <Text className="text-gray-500">Tap to choose photo</Text>
        )}
      </Pressable>

      <TextInput
        placeholder="Pet name"
        className="border px-3 py-2 rounded mb-3"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Species (Dog, Cat, etc.)"
        className="border px-3 py-2 rounded mb-3"
        value={species}
        onChangeText={setSpecies}
      />

      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        className={`p-3 rounded ${canSubmit ? "bg-green-600" : "bg-green-600/50"}`}
      >
        <Text className="text-white text-center">
          {busy ? "Saving…" : "Save Pet"}
        </Text>
      </Pressable>
    </View>
  );
}
