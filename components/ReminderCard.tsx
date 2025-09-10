import { View, Text, StyleSheet } from "react-native";

export default function ReminderCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>ReminderCard Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
