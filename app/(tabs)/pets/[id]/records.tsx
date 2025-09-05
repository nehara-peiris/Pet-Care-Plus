import { useLocalSearchParams } from "expo-router";
import { FlatList, View, Text } from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import EmptyState from "../../../../components/EmptyState";
import { Link } from "expo-router";
import { Record } from "../../../../types/record";

export default function PetRecords() {
  const { id } = useLocalSearchParams();
  const records = useSelector((s: RootState) =>
    s.records.items.filter((r: Record) => r.petId === id)
  );

  if (!records.length) return <EmptyState message="No records uploaded." />;

  return (
    <View className="flex-1 bg-black p-4">
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-neutral-800 p-4 rounded-2xl mb-2">
            <Text className="text-white">{item.title}</Text>
          </View>
        )}
      />
      <Link href={`/ (tabs)/pets/${id}/uploadRecord`} className="bg-teal-500 p-3 rounded-2xl text-center text-black mt-4">
        + Upload Record
      </Link>
    </View>
  );
}
