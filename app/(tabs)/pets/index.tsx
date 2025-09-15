// app/(tabs)/pets/index.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import PetCard from "../../../components/PetCard";
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ add theme

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
  imageUrl?: string;
};

export default function PetsIndexScreen() {
  const router = useRouter();
  const { theme } = useTheme(); // ✅ use theme
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const petsRef = collection(db, "pets");
    const petsQuery = query(petsRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(petsQuery, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Pet)
      );
      setPets(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pets", id));
      Alert.alert("Deleted", "Pet removed successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, theme === "dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "dark" ? "#fff" : "blue"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>🐾 My Pets</Text>

      <View style={[styles.addBtn, { paddingBottom: 10 }]}>
        <Button
          title="Add Pet"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={() => router.push("/(tabs)/pets/add")}
        />
      </View>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.petItem}>
            {/* Tap card → go to details */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/pets/[id]",
                  params: { id: item.id },
                })
              }
            >
              <PetCard
                name={item.name}
                type={item.type}
                imageUrl={item.imageUrl}
              />
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/pets/edit",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FF3B30" }]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, theme === "dark" && { color: "#aaa" }]}>
            No pets yet. Add one!
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "gray" },
  addBtn: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  petItem: { marginBottom: 20 },
  actions: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  actionText: { color: "#fff", fontWeight: "bold" },
});
