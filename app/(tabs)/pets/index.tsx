// app/(tabs)/pets/index.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import PetCard from "../../../components/PetCard";
import { useTheme } from "../../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";

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
  const { colors } = useTheme();
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

  const handleDelete = async (id: string, name?: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name || "this pet"}? This will also remove all related reminders and records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete reminders linked to this pet
              const remindersRef = collection(db, "reminders");
              const remindersQuery = query(remindersRef, where("petId", "==", id));
              const remindersSnap = await getDocs(remindersQuery);
              for (const r of remindersSnap.docs) {
                await deleteDoc(doc(db, "reminders", r.id));
              }

              // Delete records linked to this pet
              const recordsRef = collection(db, "records");
              const recordsQuery = query(recordsRef, where("petId", "==", id));
              const recordsSnap = await getDocs(recordsQuery);
              for (const rec of recordsSnap.docs) {
                await deleteDoc(doc(db, "records", rec.id));
              }

              // Finally, delete the pet itself
              await deleteDoc(doc(db, "pets", id));

              Toast.show({
                type: "success",
                text1: "Pet Deleted",
                text2: `${name || "Pet"} and related data removed.`,
              });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err.message || "Could not delete pet.",
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>🐾 My Pets</Text>

      <FlatList
        data={pets}
        numColumns={2} // grid layout
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.petCardWrapper,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
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

            {/* Edit/Delete actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/pets/edit",
                    params: { id: item.id },
                  })
                }
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.icon }]}>
            No pets yet. Add one!
          </Text>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/pets/add")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  petCardWrapper: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
