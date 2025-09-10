import { View, Text, StyleSheet } from "react-native";

export default function RecordsIndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pets List Screen</Text>
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
