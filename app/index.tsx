import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Generate watermark paw positions away from center (numeric px instead of %)
  const pawPrints = Array.from({ length: 12 }).map((_, i) => {
    let top = Math.random() * height;
    let left = Math.random() * width;

    // Avoid placing inside center zone
    if (top > height * 0.35 && top < height * 0.65)
      top = Math.random() > 0.5 ? Math.random() * (height * 0.3) : height * 0.7 + Math.random() * (height * 0.3);
    if (left > width * 0.35 && left < width * 0.65)
      left = Math.random() > 0.5 ? Math.random() * (width * 0.3) : width * 0.7 + Math.random() * (width * 0.3);

    return { id: i, top, left, size: 40 + Math.random() * 20 };
  });

  // Animated opacity for paw prints
  const fadeAnim = useRef(pawPrints.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    fadeAnim.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.8,
            duration: 2000 + i * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 2000 + i * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <LinearGradient
      colors={["#A8E6CF", "#D0F0C0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Watermark Layer */}
      <View style={styles.watermarkContainer}>
        {pawPrints.map((paw, i) => (
          <Animated.Text
            key={paw.id}
            style={[
              styles.watermark,
              {
                top: paw.top,
                left: paw.left,
                fontSize: paw.size,
                opacity: fadeAnim[i],
              },
            ]}
          >
            🐾
          </Animated.Text>
        ))}
      </View>

      {/* Main Content */}
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
    overflow: "hidden",
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  watermark: {
    position: "absolute",
    color: "rgba(255, 255, 255, 0.25)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 90,
    marginBottom: 24,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1B4332",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#2D6A4F",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2D6A4F",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
