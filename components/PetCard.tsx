import { View, Text, StyleSheet, Image } from "react-native";

type PetCardProps = {
  name: string;
  type: string;
  imageUrl?: string;
};

export default function PetCard({ name, type, imageUrl }: PetCardProps) {
  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>🐾</Text>
        </View>
      )}
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>{type}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 22 },
  name: { fontSize: 18, fontWeight: "bold" },
  type: { fontSize: 14, color: "gray" },
});
