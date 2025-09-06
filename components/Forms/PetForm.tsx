// components/Forms/PetForm.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { addPet, updatePet } from "../../store/slices/petSlice";
import type { Pet } from "../../types/pet";
import { uploadImageAsync } from "../../lib/storage";

type Props = {
  mode: "create" | "edit";
  initial?: Pet; // when editing
  onDone?: () => void;
};

export default function PetForm({ mode, initial, onDone }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((s: RootState) => s.auth.user?.uid) as string;

  const [name, setName] = useState(initial?.name ?? "");
  const [species, setSpecies] = useState(initial?.species ?? "");
  const [breed, setBreed] = useState(initial?.breed ?? "");
  const [sex, setSex] = useState<Pet["sex"]>(initial?.sex ?? "Unknown");
  const [dob, setDob] = useState(
    initial?.dob ? new Date(initial.dob).toISOString().slice(0, 10) : ""
  ); // YYYY-MM-DD
  const [weight, setWeight] = useState(
    initial?.weight ? String(initial.weight) : ""
  );
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow gallery access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) setLocalImage(res.assets[0].uri);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name for your pet.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "create") {
        // 1) create pet without photo
        const payload = {
          name: name.trim(),
          species: species.trim() || undefined,
          breed: breed.trim() || undefined,
          sex,
          dob: dob ? new Date(dob).getTime() : null,
          weight: weight ? Number(weight) : null,
          photoUrl: null as string | null,
        };
        const action = await dispatch(addPet({ uid, data: payload })).unwrap();

        // 2) if photo picked, upload and update pet
        if (localImage) {
          const path = `users/${uid}/pets/${action.id}.jpg`;
          const url = await uploadImageAsync(localImage, path);
          await dispatch(
            updatePet({ uid, id: action.id, data: { photoUrl: url } })
          );
        }
      } else {
        const patch: Partial<Pet> = {
          name: name.trim(),
          species: species.trim() || undefined,
          breed: breed.trim() || undefined,
          sex,
          dob: dob ? new Date(dob).getTime() : null,
          weight: weight ? Number(weight) : null,
        };
        await dispatch(updatePet({ uid, id: initial!.id, data: patch }));

        if (localImage) {
          const path = `users/${uid}/pets/${initial!.id}.jpg`;
          const url = await uploadImageAsync(localImage, path);
          await dispatch(
            updatePet({ uid, id: initial!.id, data: { photoUrl: url } })
          );
        }
      }
      onDone?.();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-3">
      <Text className="text-text-secondary">Pet name</Text>
      <TextInput
        className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
        value={name}
        onChangeText={setName}
        placeholder="Coco"
        placeholderTextColor="#777"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-text-secondary">Species</Text>
          <TextInput
            className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
            value={species}
            onChangeText={setSpecies}
            placeholder="Dog / Cat"
            placeholderTextColor="#777"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary">Breed</Text>
          <TextInput
            className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
            value={breed}
            onChangeText={setBreed}
            placeholder="Labrador"
            placeholderTextColor="#777"
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-text-secondary">Sex</Text>
          <TextInput
            className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
            value={sex}
            onChangeText={(t) => setSex((t as any) || "Unknown")}
            placeholder="Male/Female"
            placeholderTextColor="#777"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary">DOB (YYYY-MM-DD)</Text>
          <TextInput
            className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
            value={dob}
            onChangeText={setDob}
            placeholder="2022-05-01"
            placeholderTextColor="#777"
          />
        </View>
      </View>

      <Text className="text-text-secondary">Weight (kg)</Text>
      <TextInput
        className="bg-secondary rounded-2xl px-4 py-3 text-text-primary"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
        placeholder="12.5"
        placeholderTextColor="#777"
      />

      <View className="items-start mt-2">
        <Pressable
          onPress={pickImage}
          className="bg-secondary rounded-2xl px-4 py-3"
        >
          <Text className="text-text-primary">{localImage ? "Change photo" : "Pick photo"}</Text>
        </Pressable>
      </View>

      {(localImage || initial?.photoUrl) && (
        <Image
          source={{ uri: localImage || (initial?.photoUrl as string) }}
          className="w-full h-40 rounded-2xl mt-2"
          resizeMode="cover"
        />
      )}

      <Pressable
        onPress={submit}
        disabled={loading}
        className="bg-accent rounded-2xl py-3 items-center mt-4"
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-primary font-semibold">
            {mode === "create" ? "Add pet" : "Save changes"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
