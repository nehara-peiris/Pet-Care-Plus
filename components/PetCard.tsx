import { View, Text, Image } from 'react-native';
import { Pet } from '../types/pet';
import { Link } from 'expo-router';

type PetCardProps = {
  pet: Pet;
};

export default function PetCard({ pet }: PetCardProps) {
  return (
    <Link href={`/(tabs)/pets/${pet.id}/records`}>
        <View className="bg-secondary p-4 rounded-2xl mb-2 flex-row items-center">
        {pet.photoUrl && <Image source={{ uri: pet.photoUrl }} className="w-16 h-16 rounded-full mr-4" />}
        <View>
            <Text className="text-text-primary text-lg">{pet.name}</Text>
            <Text className="text-text-secondary">{pet.breed}</Text>
        </View>
        </View>
    </Link>
  );
}
