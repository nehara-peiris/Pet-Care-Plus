import { View, Text, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Pet } from "@/types/pet";
import { getAuth } from "firebase/auth";

export default function PetDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const user = getAuth().currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user || !id) return;
    const loadPet = async () => {
      const docRef = doc(db, "users", user.uid, "pets", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPet({ id: docSnap.id, ...docSnap.data() } as Pet);
      }
    };
    loadPet();
  }, [id, user]);

  if (!pet) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading pet details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="bg-white p-6 rounded-2xl shadow-md">
        <Image
          source={{ uri: pet.avatarUri || "https://placehold.co/200" }}
          className="w-40 h-40 rounded-full self-center mb-4"
        />
        <Text className="text-3xl font-bold text-center mb-2">{pet.name}</Text>
        <Text className="text-lg text-gray-600 text-center capitalize mb-4">{pet.species}</Text>

        {pet.dob && (
          <View className="flex-row justify-center items-center my-2">
            <Text className="text-base font-semibold">Born on: </Text>
            <Text className="text-base text-gray-800">{new Date(pet.dob).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={() => router.back()} className="bg-green-600 py-3 rounded-xl mt-6">
        <Text className="text-white text-center font-semibold text-base">Back to Pets</Text>
      </Pressable>
    </View>
  );
}