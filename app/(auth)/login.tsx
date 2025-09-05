import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Link, Redirect } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useSelector } from "react-redux";
import { auth } from "../../lib/firebase";
import type { RootState } from "../../store";

export default function Login() {
  const user = useSelector((s: RootState) => s.auth.user);
  if (user) return <Redirect href="/(tabs)/dashboard" />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-black">
      <Text className="text-3xl font-bold text-white mb-8">Login</Text>

      <TextInput
        className="bg-neutral-900 rounded-xl px-4 py-3 text-white mb-3"
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-neutral-900 rounded-xl px-4 py-3 text-white mb-3"
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {err && <Text className="text-red-400 mb-3">{err}</Text>}

      <Pressable onPress={submit} disabled={loading} className="bg-teal-500 rounded-2xl py-3 items-center">
        {loading ? <ActivityIndicator /> : <Text className="text-black font-semibold">Login</Text>}
      </Pressable>

      <View className="flex-row mt-6">
        <Text className="text-neutral-400 mr-2">Don’t have an account?</Text>
        <Link href="/(auth)/register" className="text-teal-400">Register</Link>
      </View>
    </View>
  );
}
