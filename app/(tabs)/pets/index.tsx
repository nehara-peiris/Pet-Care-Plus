import { View, Text, FlatList, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const snap = await getDocs(collection(db, "users", user.uid, "pets"));
      setPets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, [user]);

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white p-3 rounded-xl mb-3">
            <Image
              source={{ uri: item.avatarUrl }}
              className="w-16 h-16 rounded-full mr-3"
            />
            <View>
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-500">{item.species}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No pets yet. Add one!
          </Text>
        }
      />
      <Link href="/(tabs)/pets/add" asChild>
        <Pressable className="bg-green-600 py-3 rounded-xl mt-4">
          <Text className="text-white text-center font-semibold text-base">
            + Add Pet
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
