// app/(auth)/register.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Link, Redirect } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export default function Register() {
  const user = useSelector((s: RootState) => s.auth.user);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (user) return <Redirect href="/(tabs)/dashboard" />;

  const onChange = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setErr(null);
    if (!form.email || !form.password || !form.name) {
      setErr("Please fill all fields.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(cred.user, { displayName: form.name.trim() });

      // optional user profile doc
      await setDoc(doc(db, "users", cred.user.uid), {
        name: form.name.trim(),
        email: form.email.trim(),
        createdAt: Date.now(),
      });
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-primary">
      <Text className="text-3xl font-bold text-text-primary mb-8">Create account</Text>

      <Text className="text-text-primary mb-2">Full name</Text>
      <TextInput
        className="bg-secondary rounded-xl px-4 py-3 text-text-primary mb-4"
        placeholder="e.g., Nehara Peiris"
        placeholderTextColor="#888"
        autoCapitalize="words"
        value={form.name}
        onChangeText={(t) => onChange("name", t)}
      />

      <Text className="text-text-primary mb-2">Email</Text>
      <TextInput
        className="bg-secondary rounded-xl px-4 py-3 text-text-primary mb-4"
        placeholder="name@email.com"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(t) => onChange("email", t)}
      />

      <Text className="text-text-primary mb-2">Password</Text>
      <TextInput
        className="bg-secondary rounded-xl px-4 py-3 text-text-primary mb-4"
        placeholder="••••••••"
        placeholderTextColor="#888"
        secureTextEntry
        value={form.password}
        onChangeText={(t) => onChange("password", t)}
      />

      {err ? <Text className="text-red-400 mb-3">{err}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        className="bg-accent rounded-2xl py-3 items-center"
      >
        {loading ? <ActivityIndicator /> : <Text className="text-primary font-semibold">Sign up</Text>}
      </Pressable>

      <View className="flex-row mt-6">
        <Text className="text-text-secondary mr-2">Already have an account?</Text>
        <Link href="/(auth)/login" className="text-accent">Log in</Link>
      </View>
    </View>
  );
}

