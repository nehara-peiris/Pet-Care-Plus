import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Button,
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

  const { theme, colors, toggleTheme } = useTheme();

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
      setUserName(user.displayName || user.email?.split("@")[0] || "User");
    }
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const petsRef = collection(db, "pets");
    const petsQuery = query(petsRef, where("userId", "==", user.uid));
    const unsubscribePets = onSnapshot(petsQuery, (snapshot) => {
      const list: Pet[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Pet));
      setPets(list);
      setLoading(false);
    });

    const remindersRef = collection(db, "reminders");
    const remindersQuery = query(remindersRef, where("userId", "==", user.uid));
    const unsubscribeReminders = onSnapshot(remindersQuery, (snapshot) => {
      const list: Reminder[] = [];
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() } as Reminder)
      );
      setReminders(list);
    });

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* 🔹 Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <View style={styles.headerLeft}>
          {auth.currentUser?.photoURL ? (
            <Image source={{ uri: auth.currentUser.photoURL }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.profileInitial}>
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>PetCarePlus</Text>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hi, {userName} 👋
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
            <Text style={styles.headerIcon}>
              {theme === "light" ? "🌙" : "☀️"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{pets.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Pets</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{reminders.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Reminders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{records.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Records</Text>
        </View>
      </View>

      {/* 🔹 Pets Section */}
      <TouchableOpacity onPress={() => router.push("/(tabs)/pets")}>
        <Text style={[styles.heading, { color: colors.text }]}>🐾 My Pets</Text>
      </TouchableOpacity>
      {pets.length === 0 ? (
        <Text style={[styles.empty, { color: colors.text }]}>No pets yet. Add one!</Text>
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
      <View style={styles.addBtn}>
        <Button title="Add Pet" color={colors.primary} onPress={() => router.push("/(tabs)/pets/add")} />
      </View>

      {/* 🔹 Reminders Section */}
      <TouchableOpacity onPress={() => router.push("/(tabs)/reminders")}>
        <Text style={[styles.heading, { color: colors.text }]}>⏰ Upcoming Reminders</Text>
      </TouchableOpacity>
      {reminders.length === 0 ? (
        <Text style={[styles.empty, { color: colors.text }]}>No reminders yet. Add one!</Text>
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
      <View style={styles.addBtn}>
        <Button
          title="Add Reminder"
          color={colors.primary}
          onPress={() => router.push("/(tabs)/reminders/add")}
        />
      </View>

      {/* 🔹 Records Section */}
      <TouchableOpacity onPress={() => router.push("/(tabs)/records")}>
        <Text style={[styles.heading, { color: colors.text }]}>📑 Medical Records</Text>
      </TouchableOpacity>
      {records.length === 0 ? (
        <Text style={[styles.empty, { color: colors.text }]}>No records yet. Add one!</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {records.slice(0, 5).map((record) => (
            <RecordCard
              key={record.id}
              title={record.title}
              date={formatDate(record.date)}
              fileUrl={record.fileUrl}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/records/[id]",
                  params: { id: record.id },
                })
              }
            />
          ))}
        </ScrollView>
      )}
      <View style={styles.addBtn}>
        <Button title="Add Record" color={colors.primary} onPress={() => router.push("/(tabs)/records/add")} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },

  headerLeft: { flexDirection: "row", alignItems: "center" },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  profilePlaceholder: {
    width: 40, height: 40, borderRadius: 20, marginRight: 10,
    justifyContent: "center", alignItems: "center",
  },
  profileInitial: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  headerBtn: { marginLeft: 10 },
  headerIcon: { fontSize: 20 },

  greeting: { fontSize: 16, fontWeight: "600" },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  heading: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  empty: { textAlign: "center", marginVertical: 10 },
  addBtn: { marginTop: 10, marginBottom: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  timeline: { marginVertical: 10 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 14, marginTop: 4 },
});
