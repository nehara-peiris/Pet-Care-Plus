import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
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

export default function AddReminderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { petId: fromPet } = useLocalSearchParams<{ petId?: string }>();

  const [petId, setPetId] = useState(fromPet || "");
  const [title, setTitle] = useState("");
  const [repeat, setRepeat] = useState<"once" | "daily" | "weekly">("once");

  // 🔹 Store date+time in state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "pets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list: { id: string; name: string }[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, name: doc.data().name })
      );
      setPets(list);
    };

    fetchPets();
  }, []);

  const handleAddReminder = async () => {
    if (!title || !petId) {
      Alert.alert("Error", "Title and Pet are required!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      // ✅ Save reminder in Firestore
      await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        petId,
        title,
        type: repeat,
        date: Timestamp.fromDate(date),
        createdAt: serverTimestamp(),
      });

      // ✅ Schedule push notification
      await scheduleReminderNotification(
        title,
        date.toISOString().split("T")[0], // YYYY-MM-DD
        date.toTimeString().slice(0, 5),  // HH:mm
        repeat
      );

      Alert.alert("Success", "Reminder added!");
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Text style={[styles.title, theme === "dark" && { color: "#fff" }]}>
        Add Reminder
      </Text>

      {/* Reminder title as TextInput */}
      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        placeholder="Reminder Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
        value={title}
        onChangeText={setTitle}
      />

      {/* Date Picker */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title={`📅 Date: ${date.toLocaleDateString()}`}
          onPress={() => setShowDatePicker(true)}
        />
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Time Picker */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title={`⏰ Time: ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
          onPress={() => setShowTimePicker(true)}
        />
      </View>
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setDate(selectedTime);
          }}
        />
      )}

      {/* Repeat Picker */}
      <Text style={[styles.label, theme === "dark" && { color: "#fff" }]}>
        Repeat:
      </Text>
      <View style={[styles.pickerBox, theme === "dark" && styles.pickerBoxDark]}>
        <Picker
          selectedValue={repeat}
          onValueChange={(value) => setRepeat(value)}
          dropdownIconColor={theme === "dark" ? "#fff" : "#000"}
          style={[styles.picker, theme === "dark" && { color: "#fff" }]}
        >
          <Picker.Item label="Once" value="once" />
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
        </Picker>
      </View>

      {/* Pet selector */}
      {!petId && (
        <>
          <Text
            style={[styles.label, theme === "dark" && { color: "#fff" }]}
          >
            Select Pet:
          </Text>
          {pets.map((pet) => (
            <Button
              key={pet.id}
              title={pet.name}
              onPress={() => setPetId(pet.id)}
              color={
                petId === pet.id
                  ? theme === "dark"
                    ? "#0A84FF"
                    : "green"
                  : "gray"
              }
            />
          ))}
        </>
      )}

      {/* Actions */}
      <View style={{ marginTop: 20 }}>
        <Button
          title="Save Reminder"
          color={theme === "dark" ? "#0A84FF" : undefined}
          onPress={handleAddReminder}
        />
        <View style={{ marginTop: 10 }} />
        <Button
          title="Cancel"
          color={theme === "dark" ? "#555" : undefined}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  inputDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    color: "#fff",
  },
  label: { marginVertical: 10, fontWeight: "600" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  pickerBoxDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  picker: { height: 50, width: "100%" },
});
