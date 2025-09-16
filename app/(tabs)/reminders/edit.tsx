import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs,
  collection,
  where,
  query,
} from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { scheduleReminderNotification } from "../../../lib/notifications";
import { useTheme } from "../../../contexts/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

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
      try {
        const ref = doc(db, "reminders", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const r: any = snap.data();
          setTitle(r.title || "");
          setRepeat(r.type || "once");
          if (r.date) setDate(r.date.toDate());
          setPetId(r.petId || "");
        } else {
          Toast.show({
            type: "error",
            text1: "Reminder Not Found",
          });
        }

        // Load pets
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, "pets"),
            where("userId", "==", user.uid)
          );
          const snapPets = await getDocs(q);
          const list: { id: string; name: string }[] = [];
          snapPets.forEach((doc) =>
            list.push({ id: doc.id, name: doc.data().name })
          );
          setPets(list);
        }
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error Loading Reminder",
          text2: err.message,
        });
      }
    };
    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    if (!title.trim() || !petId) {
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Title and Pet are required!",
      });
      return;
    }

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

      Toast.show({
        type: "success",
        text1: "Reminder Updated",
        text2: `${title} updated successfully.`,
      });
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "reminders", id));
      Toast.show({
        type: "success",
        text1: "Reminder Deleted",
      });
      router.replace("/(tabs)/reminders");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: err.message,
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
      <Text style={[styles.heading, { color: colors.text }]}>✏️ Edit Reminder</Text>

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
          value={title}
          onChangeText={setTitle}
          placeholder="Reminder Title"
          placeholderTextColor={colors.icon}
        />

        {/* Date */}
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
              if (d) setDate(d);
            }}
          />
        )}

        <TouchableOpacity
          style={[
            styles.dateBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={() => setShowTime(true)}
        >
          <Ionicons name="time-outline" size={18} color={colors.icon} />
          <Text style={{ color: colors.text, marginLeft: 8 }}>
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
        <View
          style={[
            styles.pickerWrapper,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <Picker
            selectedValue={repeat}
            onValueChange={(v) => setRepeat(v)}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Once" value="once" />
            <Picker.Item label="Daily" value="daily" />
            <Picker.Item label="Weekly" value="weekly" />
          </Picker>
        </View>

        {/* Pet Selector */}
        <Text style={[styles.label, { color: colors.text }]}>Select Pet:</Text>
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

      {/* Actions */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={handleUpdate}
      >
        <Text style={styles.btnText}>💾 Update Reminder</Text>
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  label: { fontSize: 16, marginBottom: 6, fontWeight: "600" },
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
