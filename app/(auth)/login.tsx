import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useSelector } from "react-redux";
import { auth } from "../../lib/firebase";
import type { RootState } from "../../store";

export default function Login() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/dashboard");
    }
  }, [user]);

  if (user) {
    return <ActivityIndicator />;
  }

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
    <View className="flex-1 justify-center px-6 bg-primary">
      <Text className="text-3xl font-bold text-text-primary mb-8">Login</Text>

      <TextInput
        className="bg-secondary rounded-xl px-4 py-3 text-text-primary mb-3"
        placeholder="Email"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-secondary rounded-xl px-4 py-3 text-text-primary mb-3"
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {err && <Text className="text-red-400 mb-3">{err}</Text>}

      <Pressable onPress={submit} disabled={loading} className="bg-accent rounded-2xl py-3 items-center">
        {loading ? <ActivityIndicator /> : <Text className="text-primary font-semibold">Login</Text>}
      </Pressable>

      <View className="flex-row mt-6">
        <Text className="text-text-secondary mr-2">Don’t have an account?</Text>
        <Link href="/(auth)/register" className="text-accent">Register</Link>
      </View>
    </View>
  );
}
