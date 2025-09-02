// app/(auth)/login.tsx
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Feather } from "@expo/vector-icons";
const [showPw, setShowPw] = useState(false);

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    try {
      setBusy(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Unknown error');
    } finally { setBusy(false); }
  };

  const onReset = async () => {
    if (!email.trim()) return Alert.alert('Enter your email to reset');
    try {
      await resetPassword(email.trim());
      Alert.alert('Check your inbox', 'Password reset email sent.');
    } catch (e: any) {
      Alert.alert('Reset failed', e?.message ?? 'Unknown error');
    }
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
        Sign in
      </Text>

      {/* Email */}
      <View className="mb-3">
        <View className="flex-row items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl px-3">
          <Feather name="mail" size={18} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      {/* Password */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl px-3">
          <Feather name="lock" size={18} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPw}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
            <Feather
              name={showPw ? "eye-off" : "eye"}
              size={18}
              color="#6b7280"
            />
          </Pressable>
        </View>
      </View>

      {/* Submit button */}
      <Pressable
        onPress={onSubmit}
        disabled={busy}
        className={`rounded-xl py-3 ${
          busy ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {busy ? "Signing in…" : "Sign In"}
        </Text>
      </Pressable>

      {/* Reset */}
      <Pressable onPress={onReset} className="mt-3">
        <Text className="text-blue-600 text-center font-medium">
          Forgot password?
        </Text>
      </Pressable>

      {/* Register */}
      <Link
        href="/(auth)/register"
        className="mt-5 text-center text-gray-600 dark:text-gray-300"
      >
        Don’t have an account?{" "}
        <Text className="text-blue-600 font-semibold">Create one</Text>
      </Link>
    </View>
  );
}
