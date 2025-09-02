import { View, Text, FlatList, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Pet = {
  id: string;
  name: string;
  species?: string;
  avatarUrl?: string | null;
  createdAt?: any;
};

export default function Home() {
  const [pets, setPets] = useState<Pet[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "pets"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Pet)
        );
        setPets(items);
      },
      (err) => console.error("Failed to load pets:", err)
    );

    return unsub;
  }, [user]);

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <Text className="text-3xl font-bold mt-12 mb-2">Welcome back!</Text>
      <Text className="text-md text-gray-500 mb-6">
        Here's a look at your furry family.
      </Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text className="text-xl font-semibold mb-3 text-gray-700">
            Your Pets
          </Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white p-4 rounded-2xl mb-4 shadow-sm">
            <Image
              source={{
                uri:
                  item.avatarUrl ??
                  "https://placehold.co/160x160/png?text=Pet",
              }}
              className="w-20 h-20 rounded-full mr-4"
            />
            <View>
              <Text className="text-xl font-bold text-gray-800">
                {item.name}
              </Text>
              {!!item.species && (
                <Text className="text-md text-gray-600 capitalize">
                  {item.species}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center p-10 bg-white rounded-2xl">
            <Text className="text-center text-gray-500">
              You haven't added any pets yet.
            </Text>
            <Text className="text-center text-gray-400 text-sm mt-1">
              Get started by adding your first pet!
            </Text>
          </View>
        }
      />

      <Link href="/(tabs)/pets/add" asChild>
        <Pressable className="bg-green-500 py-4 rounded-2xl mt-4 shadow-md">
          <Text className="text-white text-center font-bold text-lg">
            + Add a New Pet
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
