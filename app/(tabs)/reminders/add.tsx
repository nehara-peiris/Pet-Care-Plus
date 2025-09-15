import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { addDoc, collection, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { registerForPushNotificationsAsync, scheduleReminderNotification } from "../../../lib/notifications";
import { Timestamp } from "firebase/firestore";


export default function AddReminderScreen() {
  const router = useRouter();
  const { petId: fromPet } = useLocalSearchParams<{ petId?: string }>();

  const [petId, setPetId] = useState(fromPet || "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("daily"); // daily or special
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "pets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list: { id: string; name: string }[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, name: doc.data().name }));
      setPets(list);
    };

    fetchPets();
  }, []);

  const handleAddReminder = async () => {
    if (!title || !petId || !date || !time) {
      Alert.alert("Error", "Title, Date, Time, and Pet are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      // Combine date + time into JS Date
      const reminderDate = new Date(`${date}T${time}:00`);

      await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        petId,
        title,
        type,
        date: Timestamp.fromDate(reminderDate), // ✅ Save as Firestore Timestamp
        createdAt: serverTimestamp(),
      });

      await registerForPushNotificationsAsync();
      await scheduleReminderNotification(title, date, time);

      Alert.alert("Success", "Reminder added!");
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Reminder</Text>

      <TextInput
        style={styles.input}
        placeholder="Reminder Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (HH:mm)"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={styles.input}
        placeholder="Type (daily/special)"
        value={type}
        onChangeText={setType}
      />

      {/* Only show pet selector if petId is not pre-set */}
      {!petId && (
        <>
          <Text style={styles.label}>Select Pet:</Text>
          {pets.map((pet) => (
            <Button
              key={pet.id}
              title={pet.name}
              onPress={() => setPetId(pet.id)}
              color={petId === pet.id ? "green" : "gray"}
            />
          ))}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Save Reminder" onPress={handleAddReminder} />
        <View style={{ marginTop: 10 }} />
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  label: { marginBottom: 10, fontWeight: "600" },
});
