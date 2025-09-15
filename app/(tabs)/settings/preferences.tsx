import { View, Text, StyleSheet } from "react-native";

export default function PreferencesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎨 Preferences</Text>
      <Text style={styles.sub}>Choose theme, language, and other preferences.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "gray" },
});
