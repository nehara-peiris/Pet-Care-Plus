import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type PetCardProps = {
  name: string;
  type: string;
  imageUrl?: string;
};

export default function PetCard({ name, type, imageUrl }: PetCardProps) {

  const { theme } = useTheme();

  return (
    <View style={[
        styles.card,
        theme === "dark" && { backgroundColor: "#1e1e1e", borderColor: "#333" }
      ]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, theme === "dark" && { backgroundColor: "#333" }]}>
          <Text style={[
            styles.placeholderText,
            theme === "dark" && { color: "#aaa" }
          ]}>🐾</Text>
        </View>
      )}
      <Text style={[styles.name, theme === "dark" && { color: "#fff" }]}>{name}</Text>
      <Text style={[styles.type, theme === "dark" && { color: "#bbb" }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    padding: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  placeholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 28 },
  name: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  type: { fontSize: 14, color: "gray", textAlign: "center", marginTop: 2 },
});
