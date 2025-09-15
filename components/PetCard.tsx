import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type PetCardProps = {
  name: string;
  type: string;
  imageUrl?: string;
};

export default function PetCard({ name, type, imageUrl }: PetCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.border }]}>
          <Text style={[styles.placeholderText, { color: colors.text }]}>🐾</Text>
        </View>
      )}
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.type, { color: colors.icon }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 160,
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
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 28 },
  name: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  type: { fontSize: 14, textAlign: "center", marginTop: 2 },
});
