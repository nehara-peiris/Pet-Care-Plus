import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();

  // 🔹 Ask for permissions when screen loads
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        // just silently skip, user can enable later
        console.warn("Notifications permission not granted.");
      }
    };
    requestPermission();
  }, []);

  return (
    <LinearGradient colors={["#0A84FF", "#5AC8FA"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.title}>Welcome to PetCarePlus</Text>
        <Text style={styles.subtitle}>
          Manage your pets’ health, reminders, and records all in one place.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: "#0A84FF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
