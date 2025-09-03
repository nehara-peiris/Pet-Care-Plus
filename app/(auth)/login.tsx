// app/(auth)/login.tsx
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
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 6 && !busy,
    [email, password, busy]
  );

  const onSubmit = async () => {
    try {
      if (!canSubmit) return;
      setBusy(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!/\S+@\S+\.\S+/.test(email.trim()))
      return Alert.alert("Enter a valid email to reset");
    try {
      await resetPassword(email.trim());
      Alert.alert("Check your inbox", "Password reset email sent.");
    } catch (e: any) {
      Alert.alert("Reset failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5EB]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-[92vh] justify-center"
        keyboardShouldPersistTaps="handled"
      >
        {/* Card */}
        <View className="px-6">
          <View className="bg-[#FEF1E5] rounded-[28px] pt-8 pb-8 px-5 shadow-sm border border-[#F5E7D8]">
            {/* Hero illustration */}
            <View className="items-center mb-6">
              <Image
                source={require("@/assets/pet-hero.png")}
                resizeMode="contain"
                className="w-56 h-40"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <View className="flex-row items-center gap-2 bg-white rounded-full px-4 shadow-md">
                <Feather name="mail" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-3 text-[15px]"
                  placeholder="Email"
                  placeholderTextColor="#B8B8B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-2">
              <View className="flex-row items-center gap-2 bg-white rounded-full px-4 shadow-md">
                <Feather name="lock" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-3 text-[15px]"
                  placeholder="Password"
                  placeholderTextColor="#B8B8B8"
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="go"
                  onSubmitEditing={onSubmit}
                />
                <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={10}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>

            {/* Signup link */}
            <View className="items-center mt-3">
              <Link href="/(auth)/register" className="underline text-[#6B5D4A]">
                Don’t have an account?
              </Link>
            </View>

            {/* Social row (placeholders) */}
            <View className="flex-row justify-center gap-6 mt-6">
              {[
                { icon: "facebook", color: "#F5A33A" },
                { icon: "twitter", color: "#F5A33A" },
                { icon: "google", color: "#F5A33A" },
              ].map((s, i) => (
                <Pressable
                  key={i}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ borderWidth: 1, borderColor: s.color }}
                  onPress={() => Alert.alert("Info", "Social login not set up yet")}
                >
                  <FontAwesome name={s.icon as any} size={18} color={s.color} />
                </Pressable>
              ))}
            </View>

            {/* Login button */}
            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              className="mt-7 rounded-full overflow-hidden"
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
                  {busy ? "LOGGING IN…" : "LOGIN"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Forgot password */}
            <Pressable onPress={onReset} className="mt-3">
              <Text className="text-center text-[#6B5D4A]">Forgot password?</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
