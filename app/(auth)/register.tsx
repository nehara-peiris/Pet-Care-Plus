// app/(auth)/register.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = useMemo(
    () =>
      /\S+@\S+\.\S+/.test(email.trim()) &&
      password.length >= 6 &&
      confirm === password &&
      !busy,
    [email, password, confirm, busy]
  );

  const onSubmit = async () => {
    if (password.length < 6) return Alert.alert("Password must be at least 6 characters");
    if (password !== confirm) return Alert.alert("Passwords do not match");
    try {
      if (!canSubmit) return;
      setBusy(true);
      await signUp(email.trim(), password);
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5EB]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-[92vh] justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          {/* Card */}
          <View className="bg-[#FEF1E5] rounded-[28px] pt-8 pb-8 px-5 shadow-sm border border-[#F5E7D8]">
            {/* Hero */}
            <View className="items-center mb-6">
              <Image
                source={require("@/assets/pet-hero.png")}
                resizeMode="contain"
                className="w-56 h-40"
              />
            </View>

            <Text className="text-xl font-extrabold text-[#6B5D4A] mb-5 self-center">
              Create account
            </Text>

            {/* Email */}
            <View className="mb-3">
              <View className="flex-row items-center gap-2 bg-white rounded-full px-4 shadow-md">
                <Feather name="mail" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-3 text-[15px]"
                  placeholder="you@example.com"
                  placeholderTextColor="#B8B8B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />
              </View>
              {!/\S+@\S+\.\S+/.test(email.trim()) && email.length > 0 && (
                <Text className="mt-1 text-xs text-red-500">Enter a valid email.</Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-3">
              <View className="flex-row items-center gap-2 bg-white rounded-full px-4 shadow-md">
                <Feather name="lock" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-3 text-[15px]"
                  placeholder="Password (min 6 chars)"
                  placeholderTextColor="#B8B8B8"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                />
                <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={10}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
                </Pressable>
              </View>
              {password.length > 0 && password.length < 6 && (
                <Text className="mt-1 text-xs text-amber-600">
                  Password must be at least 6 characters.
                </Text>
              )}
            </View>

            {/* Confirm password */}
            <View className="mb-2">
              <View className="flex-row items-center gap-2 bg-white rounded-full px-4 shadow-md">
                <Feather name="check" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-3 text-[15px]"
                  placeholder="Confirm password"
                  placeholderTextColor="#B8B8B8"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                />
                <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={10}>
                  <Feather
                    name={showConfirm ? "eye-off" : "eye"}
                    size={18}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
              {confirm.length > 0 && confirm !== password && (
                <Text className="mt-1 text-xs text-red-500">Passwords don’t match.</Text>
              )}
            </View>

            {/* Sign Up button */}
            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              className="mt-4 rounded-full overflow-hidden"
            >
              <LinearGradient
                colors={canSubmit ? ["#FFB347", "#FF9E2C"] : ["#FFD6A8", "#FFCFA0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4 items-center justify-center"
              >
                <Text
                  className={`text-white font-bold tracking-wider ${
                    Platform.OS === "ios" ? "text-[15px]" : "text-base"
                  }`}
                >
                  {busy ? "CREATING…" : "SIGN UP"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Login link */}
            <Link
              href="/(auth)/login"
              className="mt-5 text-center text-[#6B5D4A]"
            >
              Already have an account?{" "}
              <Text className="underline font-medium">Sign in</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
