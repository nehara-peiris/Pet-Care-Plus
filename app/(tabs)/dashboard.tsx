import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import PetCard from "../../components/PetCard";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
  imageUrl?: string;
};

type Reminder = {
  id: string;
  title: string;
  petId: string;
  date?: string;
  time?: string;
  type?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Fetch pets
    const petsRef = collection(db, "pets");
    const petsQuery = query(petsRef, where("userId", "==", user.uid));
    const unsubscribePets = onSnapshot(petsQuery, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Pet));
      setPets(list);
      setLoading(false);
    });

    // Fetch reminders
    const remindersRef = collection(db, "reminders");
    const remindersQuery = query(remindersRef, where("userId", "==", user.uid));
    const unsubscribeReminders = onSnapshot(remindersQuery, (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Reminder));
      setReminders(list);
    });

    return () => {
      unsubscribePets();
      unsubscribeReminders();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pets Section */}
      <Text style={styles.heading}>🐾 My Pets</Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(tabs)/pets/${item.id}`)}>
            <PetCard name={item.name} type={item.type} imageUrl={item.imageUrl} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pets yet. Add one!</Text>}
      />

      <View style={styles.addBtn}>
        <Button title="Add Pet" onPress={() => router.push("/(tabs)/pets/add")} />
      </View>

      {/* Reminders Section */}
      <Text style={styles.heading}>⏰ Upcoming Reminders</Text>

      {reminders.length === 0 ? (
        <Text style={styles.empty}>No reminders yet. Add one!</Text>
      ) : (
        reminders.slice(0, 5).map((reminder) => (
          <TouchableOpacity
            key={reminder.id}
            onPress={() => router.push(`/(tabs)/pets/${reminder.petId}`)}
          >
            <View style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              {reminder.date ? <Text>Date: {reminder.date}</Text> : null}
              {reminder.time ? <Text>Time: {reminder.time}</Text> : null}
              <Text>Type: {reminder.type}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.addBtn}>
        <Button title="Add Reminder" onPress={() => router.push("/(tabs)/reminders/add")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  empty: { textAlign: "center", marginVertical: 10, color: "gray" },
  addBtn: { marginTop: 10, marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  reminderCard: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  reminderTitle: { fontWeight: "bold", marginBottom: 4 },
});
