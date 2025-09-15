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
  const { colors } = useTheme();

  return (
    <View style={styles.timelineItem}>
      {/* Dot + Line */}
      <View style={styles.timelineMarker}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>

      {/* Content */}
      <TouchableOpacity
        style={[
          styles.timelineContent,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={onPress}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {date && (
          <Text style={{ color: colors.text }}>
            📅 {date} {time ? `⏰ ${time}` : ""}
          </Text>
        )}
        {type && (
          <Text style={{ color: colors.icon }}>
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
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, marginTop: 2 },
  timelineContent: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
});
