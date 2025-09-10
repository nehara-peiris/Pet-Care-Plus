import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PetCarePlus 🐾</Text>
      <Button title="Get Started" onPress={() => router.push("/(auth)/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
