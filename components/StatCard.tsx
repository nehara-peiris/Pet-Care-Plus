// app/components/StatCard.tsx
import { View, Text } from "react-native";

type StatCardProps = {
  value: string | number;
  label: string;
  bg?: string; // optional Tailwind color class
};

export default function StatCard({ value, label, bg }: StatCardProps) {
  return (
    <View
      className={`flex-1 ${bg || "bg-accent/80"} rounded-2xl p-4 mx-1 items-center shadow-md`}
    >
      <Text className="text-xl font-bold text-primary">{value}</Text>
      <Text className="text-text-secondary text-sm">{label}</Text>
    </View>
  );
}
