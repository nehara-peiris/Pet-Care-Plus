import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Platform, Button } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp, getDocs, collection, where, query } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { scheduleReminderNotification } from "../../../lib/notifications";
import { useTheme } from "../../../contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState<"once" | "daily" | "weekly">("once");
  const [date, setDate] = useState(new Date());
  const [petId, setPetId] = useState("");
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const ref = doc(db, "reminders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const r: any = snap.data();
        setTitle(r.title || "");
        setRepeat(r.type || "once");
        if (r.date) setDate(r.date.toDate());
        setPetId(r.petId || "");
      }

      // load pets
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, "pets"), where("userId", "==", user.uid));
        const snapPets = await getDocs(q);
        const list: { id: string; name: string }[] = [];
        snapPets.forEach((doc) => list.push({ id: doc.id, name: doc.data().name }));
        setPets(list);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      const ref = doc(db, "reminders", id);
      await updateDoc(ref, {
        title,
        type: repeat,
        petId,
        date: Timestamp.fromDate(date),
      });

      await scheduleReminderNotification(
        title,
        date.toISOString().split("T")[0],
        date.toTimeString().slice(0, 5),
        repeat
      );

      Alert.alert("Updated!", "Reminder updated successfully.");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "reminders", id));
      Alert.alert("Deleted!", "Reminder removed.");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>Edit Reminder</Text>

      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
      />

      <Button title={`📅 Date: ${date.toLocaleDateString()}`} onPress={() => setShowDate(true)} />
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowDate(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Button
        title={`⏰ Time: ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        onPress={() => setShowTime(true)}
      />
      {showTime && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowTime(false);
            if (d) setDate(d);
          }}
        />
      )}

      <Text style={[styles.label, theme === "dark" && { color: "#fff" }]}>Repeat:</Text>
      <Picker selectedValue={repeat} onValueChange={(v) => setRepeat(v)}>
        <Picker.Item label="Once" value="once" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
      </Picker>

      <Text style={[styles.label, theme === "dark" && { color: "#fff" }]}>Select Pet:</Text>
      {pets.map((pet) => (
        <Button
          key={pet.id}
          title={pet.name}
          onPress={() => setPetId(pet.id)}
          color={petId === pet.id ? "#0A84FF" : "gray"}
        />
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title="Update" color="#0A84FF" onPress={handleUpdate} />
        <View style={{ marginTop: 10 }} />
        <Button title="Delete Reminder" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  inputDark: { backgroundColor: "#1e1e1e", borderColor: "#333", color: "#fff" },
  label: { marginVertical: 10, fontWeight: "600" },
});
