import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const { user, signOut } = useAuth();
  return (
    <View className="flex-1 p-5">
      <Text className="text-xl font-bold mb-3">Settings</Text>
      <Text className="text-gray-600 mb-6">Signed in as {user?.email}</Text>
      <Pressable onPress={signOut} className="bg-red-600 p-3 rounded">
        <Text className="text-white text-center">Logout</Text>
      </Pressable>
    </View>
  );
}
