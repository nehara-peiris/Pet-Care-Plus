import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import PetCard from "../../components/PetCard";
import ReminderCard from "../../components/ReminderCard";
import RecordCard from "../../components/RecordCard";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useTheme } from "@/contexts/ThemeContext";

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
  date?: Timestamp;
  time?: string;
  type?: string;
};

type Record = {
  id: string;
  title: string;
  date?: Timestamp;
  fileUrl?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // 🔧 Helper to safely format Firestore Timestamp or string
  const formatDate = (ts?: Timestamp | string) => {
    if (!ts) return "";
    try {
      if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString();
      }
      if (typeof ts === "string") {
        return new Date(ts).toLocaleDateString();
      }
      return String(ts);
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Prefer displayName if available, otherwise fallback to email
      setUserName(user.displayName || user.email?.split("@")[0] || "User");
    }
  }, []);

  // Fetch data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Pets
    const petsRef = collection(db, "pets");
    const petsQuery = query(petsRef, where("userId", "==", user.uid));
    const unsubscribePets = onSnapshot(petsQuery, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Pet));
      setPets(list);
      setLoading(false);
    });

    // Reminders
    const remindersRef = collection(db, "reminders");
    const remindersQuery = query(remindersRef, where("userId", "==", user.uid));
    const unsubscribeReminders = onSnapshot(remindersQuery, (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Reminder)
      );
      setReminders(list);
    });

    // Records
    const recordsRef = collection(db, "records");
    const recordsQuery = query(recordsRef, where("userId", "==", user.uid));
    const unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
      const list: Record[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Record));
      setRecords(list);
    });

    return () => {
      unsubscribePets();
      unsubscribeReminders();
      unsubscribeRecords();
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
    <ScrollView
    contentContainerStyle={[
        styles.container,
        theme === "dark" && { backgroundColor: "#121212" }
      ]}
      >
      {/* 🔹 Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {auth.currentUser?.photoURL ? (
            <Image
              source={{ uri: auth.currentUser.photoURL }}
              style={styles.profilePic}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>PetCarePlus</Text>
            <Text style={styles.greeting}>Hi, {userName} 👋</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            style={styles.headerBtn}
          >
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pets Section */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/pets")}>
          <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
            🐾 My Pets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)/pets/add")}>
          <Text style={styles.addText}>+Add</Text>
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <Text style={styles.empty}>No pets yet. Add one!</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              onPress={() => router.push(`/(tabs)/pets/${pet.id}`)}
            >
              <PetCard name={pet.name} type={pet.type} imageUrl={pet.imageUrl} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Reminders Section */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/reminders")}>
          <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
            ⏰ Upcoming Reminders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/reminders/add")}
        >
          <Text style={styles.addText}>+Add</Text>
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <Text style={styles.empty}>No reminders yet. Add one!</Text>
      ) : (
        <View style={styles.timeline}>
          {reminders.slice(0, 5).map((reminder, index, arr) => (
            <ReminderCard
              key={reminder.id}
              title={reminder.title}
              date={formatDate(reminder.date)}
              time={reminder.time}
              type={reminder.type}
              isLast={index === arr.length - 1}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/reminders/[id]",
                  params: { id: reminder.id },
                })
              }
            />
          ))}
        </View>
      )}      


      {/* Records Section */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/records")}>
          <Text style={[styles.heading, theme === "dark" && { color: "#fff" }]}>
            📑 Medical Record
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/records/add")}
        >
          <Text style={styles.addText}>+Add</Text>
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <Text style={styles.empty}>No records yet. Add one!</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
        >
          {records.slice(0, 5).map((record) => (
            <RecordCard
              key={record.id}
              title={record.title}
              date={formatDate(record.date)}
              fileUrl={record.fileUrl}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/records/view",
                  params: { id: record.id },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#fff" },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },

  // 🔹 Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerActions: { flexDirection: "row" },
  headerBtn: { marginLeft: 15 },
  headerIcon: { fontSize: 20 },

  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  heading: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  empty: { textAlign: "center", marginVertical: 10, color: "gray" },
  addBtn: { marginTop: 10, marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  timeline: {
    marginVertical: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineMarker: {
    alignItems: "center",
    marginRight: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#ccc",
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  reminderTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },

  recordScroll: {
    marginVertical: 10,
  },
  recordCard: {
    width: 140,
    marginRight: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  pdfBox: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#e6f0ff",
    justifyContent: "center",
    alignItems: "center",
  },
  noFileBox: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  addText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    paddingHorizontal: 8,
  },
});
