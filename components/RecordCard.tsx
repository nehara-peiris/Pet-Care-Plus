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
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      {fileUrl ? (
        isPdf ? (
          <View style={[styles.pdfBox, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: colors.text }}>📄</Text>
          </View>
        ) : (
          <Image source={{ uri: fileUrl }} style={styles.thumbnail} />
        )
      ) : (
        <View style={[styles.noFileBox, { backgroundColor: colors.border }]}>
          <Text style={{ color: colors.text }}>❌</Text>
        </View>
      )}

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      {date && (
        <Text style={[styles.date, { color: colors.icon }]}>{date}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    padding: 10,
    borderWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  noFileBox: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  date: { fontSize: 12, textAlign: "center" },
});
