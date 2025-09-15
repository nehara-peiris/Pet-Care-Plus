import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type ReminderCardProps = {
  title: string;
  date?: string;
  time?: string;
  type?: string;
  isLast?: boolean;
  onPress?: () => void;
};

export default function ReminderCard({
  title,
  date,
  time,
  type,
  isLast,
  onPress,
}: ReminderCardProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.timelineItem}>
      {/* Dot + Line */}
      <View style={styles.timelineMarker}>
        <View
          style={[
            styles.dot,
            theme === "dark" && { backgroundColor: "#4A90E2" },
          ]}
        />
        {!isLast && (
          <View
            style={[
              styles.line,
              theme === "dark" && { backgroundColor: "#444" },
            ]}
          />
        )}
      </View>

      {/* Content */}
      <TouchableOpacity
        style={[
          styles.timelineContent,
          theme === "dark" && {
            backgroundColor: "#1e1e1e",
            borderColor: "#333",
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[styles.title, theme === "dark" && { color: "#fff" }]}
        >
          {title}
        </Text>

        {date && (
          <Text style={theme === "dark" ? { color: "#ddd" } : undefined}>
            📅 {date} {time ? `⏰ ${time}` : ""}
          </Text>
        )}
        {type && (
          <Text style={theme === "dark" ? { color: "#aaa" } : { color: "gray" }}>
            Type: {type}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineItem: { flexDirection: "row", marginBottom: 20 },
  timelineMarker: { alignItems: "center", marginRight: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#007AFF" },
  line: { width: 2, flex: 1, backgroundColor: "#ccc", marginTop: 2 },
  timelineContent: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
});
