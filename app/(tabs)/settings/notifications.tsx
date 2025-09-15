import { View, Text, StyleSheet } from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔔 Notifications</Text>
      <Text style={styles.sub}>Manage reminders and push notification settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "gray" },
});
