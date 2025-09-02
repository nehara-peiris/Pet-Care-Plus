// app/(auth)/register.tsx
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Feather } from "@expo/vector-icons";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (password.length < 6) return Alert.alert('Password must be at least 6 characters');
    if (password !== confirm) return Alert.alert('Passwords do not match');
    try {
      setBusy(true);
      await signUp(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Unknown error');
    } finally { setBusy(false); }
  };

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit =
    /\S+@\S+\.\S+/.test(email.trim()) &&
    password.length >= 6 &&
    confirm === password &&
    !busy;

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
        Create account
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
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        {!/\S+@\S+\.\S+/.test(email.trim()) && email.length > 0 && (
          <Text className="mt-1 text-xs text-red-500">Enter a valid email.</Text>
        )}
      </View>

      {/* Password */}
      <View className="mb-3">
        <View className="flex-row items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl px-3">
          <Feather name="lock" size={18} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100"
            placeholder="Password (min 6 chars)"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPw}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
            <Feather name={showPw ? "eye-off" : "eye"} size={18} color="#6b7280" />
          </Pressable>
        </View>
        {password.length > 0 && password.length < 6 && (
          <Text className="mt-1 text-xs text-amber-600">
            Password must be at least 6 characters.
          </Text>
        )}
      </View>

      {/* Confirm password */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-xl px-3">
          <Feather name="check" size={18} color="#6b7280" />
          <TextInput
            className="flex-1 py-3 text-base text-neutral-900 dark:text-neutral-100"
            placeholder="Confirm password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
          />
          <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={8}>
            <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color="#6b7280" />
          </Pressable>
        </View>
        {confirm.length > 0 && confirm !== password && (
          <Text className="mt-1 text-xs text-red-500">Passwords don’t match.</Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit || busy}
        className={`rounded-xl py-3 ${
          !canSubmit || busy
            ? "bg-green-600/50"
            : "bg-green-600 active:bg-green-700"
        }`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {busy ? "Creating…" : "Sign Up"}
        </Text>
      </Pressable>

      {/* Login link */}
      <Link
        href="/(auth)/login"
        className="mt-5 text-center text-gray-600 dark:text-gray-300"
      >
        Already have an account?{" "}
        <Text className="text-blue-600 font-semibold">Sign in</Text>
      </Link>
    </View>
  );

}
