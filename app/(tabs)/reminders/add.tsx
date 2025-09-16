import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Platform, Button } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { scheduleReminderNotification } from "../../../lib/notifications";
import { useTheme } from "../../../contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

export default function AddReminderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { petId: fromPet } = useLocalSearchParams<{ petId?: string }>();

  const [petId, setPetId] = useState(fromPet || "");
  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState<"once" | "daily" | "weekly">("once");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "pets"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list: { id: string; name: string }[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, name: doc.data().name }));
      setPets(list);
    };
    fetchPets();
  }, []);

  const handleSave = async () => {
    if (!title || !petId) {
      Alert.alert("Error", "Title and Pet are required!");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        petId,
        title,
        type: repeat,
        date: Timestamp.fromDate(date),
        createdAt: serverTimestamp(),
      });

      await scheduleReminderNotification(
        title,
        date.toISOString().split("T")[0],
        date.toTimeString().slice(0, 5),
        repeat
      );

      Alert.alert("Success", "Reminder saved!");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
        Add Reminder
      </Text>

      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        placeholder="Reminder Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={title}
        onChangeText={setTitle}
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
      <Picker
        selectedValue={repeat}
        onValueChange={(v) => setRepeat(v)}
        style={[theme === "dark" && { color: "#fff" }]}
      >
        <Picker.Item label="Once" value="once" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
      </Picker>

      {!petId && (
        <>
          <Text style={[styles.label, theme === "dark" && { color: "#fff" }]}>
            Select Pet:
          </Text>
          {pets.map((pet) => (
            <Button
              key={pet.id}
              title={pet.name}
              onPress={() => setPetId(pet.id)}
              color={petId === pet.id ? "#0A84FF" : "gray"}
            />
          ))}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Save" color="#0A84FF" onPress={handleSave} />
        <View style={{ marginTop: 10 }} />
        <Button title="Cancel" onPress={() => router.back()} />
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
