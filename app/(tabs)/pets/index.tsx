import { FlatList, View } from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import PetCard from "../../../components/PetCard";
import EmptyState from "../../../components/EmptyState";
import { Link } from "expo-router";

export default function PetsList() {
  const pets = useSelector((s: RootState) => s.pets.items);

  if (!pets.length) return <EmptyState message="No pets yet. Add one!" />;

  return (
    <View className="flex-1 bg-black p-4">
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PetCard pet={item} />}
      />
      <Link href="/(tabs)/pets/add" className="bg-teal-500 p-3 rounded-2xl text-center text-black mt-4">
        + Add Pet
      </Link>
    </View>
  );
}
