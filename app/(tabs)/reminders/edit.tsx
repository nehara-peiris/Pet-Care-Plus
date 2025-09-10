import { View, Text, StyleSheet } from "react-native";

export default function EditReminderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Edit Reminder Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
  },
});
