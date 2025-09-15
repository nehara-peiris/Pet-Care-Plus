import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type RecordCardProps = {
  title: string;
  date?: string;
  fileUrl?: string;
  onPress?: () => void;
};

export default function RecordCard({ title, date, fileUrl, onPress }: RecordCardProps) {
  const isPdf = fileUrl?.endsWith(".pdf");
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        theme === "dark" && { backgroundColor: "#1e1e1e", borderColor: "#333" },
      ]}
      onPress={onPress}
    >
      {fileUrl ? (
        isPdf ? (
          <View
            style={[
              styles.pdfBox,
              theme === "dark" && { backgroundColor: "#2a2a40" },
            ]}
          >
            <Text style={theme === "dark" ? { color: "#fff" } : undefined}>📄</Text>
          </View>
        ) : (
          <Image source={{ uri: fileUrl }} style={styles.thumbnail} />
        )
      ) : (
        <View
          style={[
            styles.noFileBox,
            theme === "dark" && { backgroundColor: "#333" },
          ]}
        >
          <Text style={theme === "dark" ? { color: "#fff" } : undefined}>❌</Text>
        </View>
      )}

      <Text
        style={[styles.title, theme === "dark" && { color: "#fff" }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {date && (
        <Text
          style={[
            styles.date,
            theme === "dark" && { color: "#aaa" },
          ]}
        >
          {date}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  pdfBox: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#e6f0ff",
    justifyContent: "center",
    alignItems: "center",
  },
  noFileBox: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  date: { fontSize: 12, color: "gray", textAlign: "center" },
});
