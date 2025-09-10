import { View, Text, StyleSheet } from "react-native";

export default function AddRecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Record Screen</Text>
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
