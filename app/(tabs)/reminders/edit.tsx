// app/(tabs)/reminders/edit.tsx
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
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  scheduleReminderNotification,
  cancelReminderNotification,
} from "../../../lib/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function EditReminderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [type, setType] = useState<"once" | "daily" | "weekly">("once");
  const [notificationId, setNotificationId] = useState<string | null>(null);

  // 🔹 Pet handling
  const [petId, setPetId] = useState("");
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadReminder = async () => {
      if (!id) return;
      const ref = doc(db, "reminders", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const r = snap.data() as any;
        setTitle(r.title || "");
        setType(r.type || "once");
        setNotificationId(r.notificationId || null);
        setPetId(r.petId || "");

        if (r.date) {
          const jsDate = r.date.toDate();
          setDate(jsDate);
        }
      }
    };

    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(collection(db, "pets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list: { id: string; name: string }[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, name: doc.data().name }));
      setPets(list);
    };

    loadReminder();
    fetchPets();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      if (notificationId) {
        await cancelReminderNotification(notificationId);
      }

      const newNotificationId = await scheduleReminderNotification(
        title,
        date.toISOString().split("T")[0],
        date.toTimeString().slice(0, 5),
        type
      );

      const ref = doc(db, "reminders", id);
      await updateDoc(ref, {
        title,
        type,
        petId,
        date: Timestamp.fromDate(date),
        notificationId: newNotificationId,
      });

      Alert.alert("Updated!", "Reminder updated successfully.");
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      if (notificationId) {
        await cancelReminderNotification(notificationId);
      }
      await deleteDoc(doc(db, "reminders", id));
      Alert.alert("Deleted!", "Reminder removed.");
      router.replace("/(tabs)/reminders");
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
      <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
        Edit Reminder
      </Text>

      {/* Reminder Title */}
      <TextInput
        style={[styles.input, theme === "dark" && styles.inputDark]}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme === "dark" ? "#888" : "#999"}
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
          selectedValue={type}
          onValueChange={(value) => setType(value)}
          dropdownIconColor={theme === "dark" ? "#fff" : "#000"}
          style={[styles.picker, theme === "dark" && { color: "#fff" }]}
        >
          <Picker.Item label="Once" value="once" />
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
        </Picker>
      </View>

      {/* Pet Selector */}
      <Text style={[styles.label, theme === "dark" && { color: "#fff" }]}>
        Pet:
      </Text>
      <View style={[styles.pickerBox, theme === "dark" && styles.pickerBoxDark]}>
        <Picker
          selectedValue={petId}
          onValueChange={(value) => setPetId(value)}
          dropdownIconColor={theme === "dark" ? "#fff" : "#000"}
          style={[styles.picker, theme === "dark" && { color: "#fff" }]}
        >
          {pets.map((pet) => (
            <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
          ))}
        </Picker>
      </View>

      {/* Actions */}
      <Button
        title="Update"
        color={theme === "dark" ? "#0A84FF" : undefined}
        onPress={handleUpdate}
      />
      <View style={{ marginTop: 12 }} />
      <Button title="Delete Reminder" color="red" onPress={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
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
