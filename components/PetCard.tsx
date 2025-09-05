import { View, Text, Image } from 'react-native';
import { Pet } from '../types/pet';
import { Link } from 'expo-router';

type PetCardProps = {
  pet: Pet;
};

export default function PetCard({ pet }: PetCardProps) {
  return (
    <Link href={`/(tabs)/pets/${pet.id}/records`}>
        <View className="bg-neutral-800 p-4 rounded-2xl mb-2 flex-row items-center">
        {pet.photoUrl && <Image source={{ uri: pet.photoUrl }} className="w-16 h-16 rounded-full mr-4" />}
        <View>
            <Text className="text-white text-lg">{pet.name}</Text>
            <Text className="text-gray-400">{pet.breed}</Text>
        </View>
        </View>
    </Link>
  );
}
