import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
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
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function AddReminderScreen() {
  const router = useRouter();
  const { theme, colors } = useTheme();
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
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Title and Pet are required!",
      });
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "You must be logged in to add a reminder.",
        });
        return;
      }

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

      Toast.show({
        type: "success",
        text1: "Reminder Saved",
        text2: `${title} has been scheduled.`,
      });
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Save Error",
        text2: err.message || "Could not save reminder.",
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>⏰ Add Reminder</Text>

      {/* Card Wrapper */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Title */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Reminder Title"
          placeholderTextColor={colors.icon}
          value={title}
          onChangeText={setTitle}
        />

        {/* Date Picker */}
        <TouchableOpacity
          style={[
            styles.dateBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => setShowDate(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.icon} />
          <Text style={{ color: colors.text, marginLeft: 8 }}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => {
              setShowDate(false);
              if (!d) {
                Toast.show({ type: "info", text1: "Date not selected" });
                return;
              }
              setDate(d);
            }}
          />
        )}

        {/* Time Picker */}
        <TouchableOpacity
          style={[
            styles.dateBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => setShowTime(true)}
        >
          <Ionicons name="time-outline" size={18} color={colors.icon} />
          <Text style={{ color: colors.text, marginLeft: 8 }}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
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

        {/* Repeat Picker */}
        <Text style={[styles.label, { color: colors.text }]}>Repeat:</Text>
        <Picker
          selectedValue={repeat}
          onValueChange={(v) => setRepeat(v)}
          style={{ color: colors.text }}
        >
          <Picker.Item label="Once" value="once" />
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
        </Picker>

        {/* Pet Selector */}
        {!fromPet && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { color: colors.text }]}>
              Select Pet:
            </Text>
            <View style={styles.petRow}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    {
                      backgroundColor:
                        petId === pet.id ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setPetId(pet.id)}
                >
                  <Text
                    style={{
                      color: petId === pet.id ? "#fff" : colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.btnText}>💾 Save Reminder</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.border }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.btnText, { color: colors.text }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  label: { marginVertical: 10, fontWeight: "600" },
  petRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  petOption: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  btnText: { fontWeight: "bold", fontSize: 16, color: "#fff" },
});
