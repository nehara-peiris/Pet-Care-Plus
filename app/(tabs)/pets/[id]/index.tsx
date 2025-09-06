import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function PetDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Stack.Screen options={{ headerTitle: `Pet ${id}` }} />
      <Text>Pet ID: {id}</Text>
    </View>
  );
}
