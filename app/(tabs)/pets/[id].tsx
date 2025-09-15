import { useLocalSearchParams, useRouter } from "expo-router"; 
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc, collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
  imageUrl?: string;
};

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);

  const formatDate = (ts?: Timestamp | string, withTime = false) => {
    if (!ts) return "N/A";
    try {
      if (ts instanceof Timestamp) {
        return withTime
          ? ts.toDate().toLocaleString()
          : ts.toDate().toLocaleDateString();
      }
      if (typeof ts === "string") {
        const d = new Date(ts);
        return withTime ? d.toLocaleString() : d.toLocaleDateString();
      }
      return String(ts);
    } catch {
      return "Invalid date";
    }
  };

  // Fetch pet details
  useEffect(() => {
    if (!id) return;
    const fetchPet = async () => {
      try {
        const docRef = doc(db, "pets", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPet({ id: snap.id, ...snap.data() } as Pet);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pet:", err);
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // Fetch reminders linked to this pet
  useEffect(() => {
    if (!id) return;
    const remindersRef = collection(db, "reminders");
    const q = query(remindersRef, where("petId", "==", id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReminders(list);
    });
    return unsubscribe;
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    Alert.alert("Delete Pet", "Are you sure you want to delete this pet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "pets", id));
            Alert.alert("Success", "Pet deleted successfully!");
            router.replace("/(tabs)/dashboard");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.center}>
        <Text>Pet not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{pet.name}</Text>

      {pet.imageUrl ? (
        <Image
          source={{ uri: pet.imageUrl }}
          style={{ width: 150, height: 150, borderRadius: 75, marginBottom: 20 }}
        />
      ) : null}

      <Text style={styles.detail}>Type: {pet.type}</Text>
      {pet.age ? <Text style={styles.detail}>Age: {pet.age}</Text> : null}
      {pet.breed ? <Text style={styles.detail}>Breed: {pet.breed}</Text> : null}

      <View style={styles.buttons}>
        <Button title="Back" onPress={() => router.back()} />
        <Button title="Edit Pet" onPress={() => router.push(`/(tabs)/pets/edit?id=${pet.id}`)} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Delete Pet" color="red" onPress={handleDelete} />
      </View>

      {/* Reminders Section */}
      <Text style={styles.reminderTitle}>Reminders</Text>
      {reminders.length === 0 ? (
        <Text style={styles.noReminders}>No reminders yet.</Text>
      ) : (
        reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Text style={styles.reminderText}>{reminder.title}</Text>
            {reminder.date ? (
              <Text>Date: {formatDate(reminder.date)}</Text>
            ) : null}
            {reminder.time ? <Text>Time: {reminder.time}</Text> : null}
            <Text>Type: {reminder.type}</Text>
          </View>
        ))
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Add Reminder"
          onPress={() => router.push(`/(tabs)/reminders/add?petId=${pet.id}`)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  detail: { fontSize: 18, marginBottom: 10 },
  buttons: { marginTop: 20, flexDirection: "row", justifyContent: "space-between" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  reminderTitle: { fontSize: 22, fontWeight: "bold", marginTop: 30 },
  noReminders: { marginTop: 10, color: "gray" },
  reminderCard: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  reminderText: { fontWeight: "bold", marginBottom: 5 },
});
