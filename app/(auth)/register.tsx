import { Link, router } from "expo-router";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = async () => {
    try {
      await signUp(email, pw);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center gap-4 px-6">
      <Text className="text-white text-3xl font-semibold">Create account</Text>
      <TextInput className="w-80 bg-white/10 text-white px-3 py-2 rounded" placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput className="w-80 bg-white/10 text-white px-3 py-2 rounded" placeholder="Password" placeholderTextColor="#aaa" secureTextEntry value={pw} onChangeText={setPw} />
      <Pressable className="w-80 items-center justify-center rounded bg-blue-600 py-3" onPress={onSubmit}>
        <Text className="text-white font-medium">Sign up</Text>
      </Pressable>
      <Link href="/(auth)/login" className="text-blue-400 mt-2">Already have an account?</Link>
    </View>
  );
}