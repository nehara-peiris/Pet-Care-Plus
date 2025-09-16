import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useTheme } from "@/contexts/ThemeContext";
import { exportRecords } from "@/lib/exportRecords";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

type Pet = {
  id: string;
  name: string;
  type: string;
  age?: string;
  breed?: string;
  imageUrl?: string;
};

type Record = {
  id: string;
  title: string;
  date?: Timestamp;
  fileUrl?: string;
};

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

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
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load pet details.",
        });
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // Reminders for this pet
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "reminders"), where("petId", "==", id));
    return onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReminders(list);
    });
  }, [id]);

  // Records for this pet
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "records"), where("petId", "==", id));
    return onSnapshot(q, (snapshot) => {
      const list: Record[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Record)
      );
      setRecords(list);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "pets", id));
      Toast.show({
        type: "success",
        text1: "Pet deleted",
        text2: `${pet?.name || "Pet"} has been removed.`,
      });
      router.replace("/(tabs)/dashboard");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: err.message || "Could not delete pet.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!pet) {
    Toast.show({
      type: "error",
      text1: "Not Found",
      text2: "This pet does not exist or has been removed.",
    });

    return (
      <View style={styles.center}>
        <Text style={[styles.text, { color: colors.text }]}>Pet not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff" }}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>{pet.name}</Text>

      {pet.imageUrl && (
        <Image
          source={{ uri: pet.imageUrl }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            marginBottom: 20,
            alignSelf: "center",
          }}
        />
      )}

      <Text style={[styles.detail, { color: colors.text }]}>
        Type: {pet.type}
      </Text>
      {pet.age && (
        <Text style={[styles.detail, { color: colors.text }]}>Age: {pet.age}</Text>
      )}
      {pet.breed && (
        <Text style={[styles.detail, { color: colors.text }]}>
          Breed: {pet.breed}
        </Text>
      )}

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "purple" }]}
          onPress={async () => {
            try {
              await exportRecords("pet", pet.id);
              Toast.show({
                type: "success",
                text1: "Export Successful",
                text2: `${pet.name}'s records exported.`,
              });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: err.message || "Something went wrong.",
              });
            }
          }}
        >
          <Text style={styles.btnText}>Export Records</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/pets/edit?id=${pet.id}`)}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff" }}>Edit Pet</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleDelete}
        style={[styles.button, { backgroundColor: "red", marginTop: 20 }]}
      >
        <Text style={{ color: "#fff" }}>Delete Pet</Text>
      </TouchableOpacity>

      {/* Reminders */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Reminders
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/reminders/add?petId=${pet.id}`)}
        >
          <Text style={[styles.addIcon, { color: colors.primary }]}>➕</Text>
        </TouchableOpacity>
      </View>
      {reminders.length === 0 ? (
        <Text style={[styles.noData, { color: colors.icon }]}>
          No reminders yet.
        </Text>
      ) : (
        reminders.map((reminder) => (
          <View
            key={reminder.id}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {reminder.title}
            </Text>
            {reminder.date && (
              <Text style={{ color: colors.icon }}>
                Date: {formatDate(reminder.date)}
              </Text>
            )}
            {reminder.time && (
              <Text style={{ color: colors.icon }}>Time: {reminder.time}</Text>
            )}
            <Text style={{ color: colors.icon }}>Type: {reminder.type}</Text>
          </View>
        ))
      )}

      {/* Records */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Medical Records
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/records/add?petId=${pet.id}`)}
        >
          <Text style={[styles.addIcon, { color: colors.primary }]}>➕</Text>
        </TouchableOpacity>
      </View>
      {records.length === 0 ? (
        <Text style={[styles.noData, { color: colors.icon }]}>
          No records yet.
        </Text>
      ) : (
        records.map((record) => (
          <View
            key={record.id}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {record.title}
            </Text>
            {record.date && (
              <Text style={{ color: colors.icon }}>
                Date: {formatDate(record.date)}
              </Text>
            )}
            {record.fileUrl && (
              <Text
                style={{
                  color: colors.primary,
                  textDecorationLine: "underline",
                }}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/records/[id]",
                    params: { id: record.id },
                  })
                }
              >
                View File
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  detail: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 16 },
  buttons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  sectionHeader: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold" },
  addIcon: { fontSize: 22, paddingHorizontal: 6 },
  noData: { marginTop: 10 },
  card: { marginTop: 10, padding: 12, borderWidth: 1, borderRadius: 8 },
  cardTitle: { fontWeight: "bold", marginBottom: 5 },
  btnText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
});
