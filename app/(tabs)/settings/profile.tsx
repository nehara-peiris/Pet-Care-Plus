import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 Profile Settings</Text>
      <Text style={styles.sub}>Here you can view and update your profile details.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "gray" },
});
