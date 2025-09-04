import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { demoPets } from "@/services/data";

export default function Pets() {
  return (
    <View className="flex-1 bg-black px-4 pt-10 gap-4">
      <Text className="text-white text-2xl font-semibold">Your Pets</Text>

      <TextInput
        placeholder="Search by name or species"
        placeholderTextColor="#9ca3af"
        className="bg-white/10 text-white px-3 py-2 rounded"
      />

      <FlatList
        data={demoPets}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View className="flex-row gap-3 items-center bg-white/5 rounded-xl p-3">
            <Image
              source={{ uri: item.avatarUrl || "https://placekitten.com/128/128" }}
              className="w-14 h-14 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-white font-medium">{item.name}</Text>
              <Text className="text-white/60 text-xs">{item.species} • {item.weightKg ?? "?"} kg</Text>
              <Text className="text-white/50 text-xs">Next vet: {item.nextVetVisit ?? "—"}</Text>
            </View>
            <Pressable className="bg-blue-600 px-3 py-1.5 rounded">
              <Text className="text-white text-sm">Schedule</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable className="self-center bg-blue-500 px-5 py-3 rounded-xl">
        <Text className="text-white font-medium">Add Pet</Text>
      </Pressable>
    </View>
  );
}
