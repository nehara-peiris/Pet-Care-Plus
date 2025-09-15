// app/(tabs)/settings/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { auth } from "../../../lib/firebase";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../../contexts/ThemeContext";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function SettingsScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile edit state
  const [newName, setNewName] = useState(user?.displayName || "");
  const [newPhoto, setNewPhoto] = useState(user?.photoURL || "");

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔹 Change Password
  const confirmPasswordChange = async () => {
    if (!user || !user.email) return;
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Both current and new password are required.");
      return;
    }

    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      await updatePassword(user, newPassword);

      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Success", "Password updated successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔹 Delete Account
  const confirmDelete = async () => {
    if (!user || !user.email) return;
    if (!deletePassword) {
      Alert.alert("Error", "Password is required.");
      return;
    }

    try {
      const cred = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, cred);

      await deleteUser(user);

      setShowDeleteModal(false);
      setDeletePassword("");
      Alert.alert("Deleted", "Your account has been permanently deleted.");
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // 🔹 Update Profile
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewPhoto(result.assets[0].uri);
    }
  };

  const confirmProfileUpdate = async () => {
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhoto,
      });

      setShowProfileModal(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);

    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { notifications: value });
    }
  };

  return (
    <View style={[ styles.container,  theme === "dark" && { backgroundColor: "#121212" }, ]}>
      {/* Profile */}
      <View style={[styles.profileCard, theme === "dark" && { backgroundColor: "#1e1e1e" }]}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic,theme === "dark" ? { backgroundColor: "#333" } : { backgroundColor: "#ddd" },]}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </View>
        )}
        <Text style={[styles.profileTitle, theme === "dark" && { color: "#fff" }]}>{user?.displayName || "User"}</Text>
        <Text style={[styles.profileEmail, theme === "dark" && { color: "#aaa" }]}>{user?.email}</Text>
      </View>

      {/* Toggles */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, theme === "dark" && { color: "#fff" }]}>🌙 Dark Mode</Text>
        <Switch value={theme === "dark"} onValueChange={toggleTheme} />
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, theme === "dark" && { color: "#fff" }]}>🔔 Notifications</Text>
        <Switch value={notifications} onValueChange={handleToggleNotifications} />
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setShowProfileModal(true)}
      >
        <Text style={styles.actionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => setShowPasswordModal(true)}
      >
        <Text style={styles.actionText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
        onPress={handleLogout}
      >
        <Text style={[styles.actionText, { color: "#fff" }]}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: "#ff4d4d" }]}
        onPress={() => setShowDeleteModal(true)}
      >
        <Text style={[styles.actionText, { color: "#fff" }]}>Delete Account</Text>
      </TouchableOpacity>

      {/* 🔹 Profile Modal */}
      <Modal transparent visible={showProfileModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>

            <TouchableOpacity onPress={pickProfileImage}>
              {newPhoto ? (
                <Image source={{ uri: newPhoto }} style={styles.modalPic} />
              ) : (
                <View style={[styles.modalPic, { backgroundColor: "#eee" }]}>
                  <Text>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={newName}
              onChangeText={setNewName}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                onPress={confirmProfileUpdate}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* 🔹 Change Password Modal */}
      <Modal transparent visible={showPasswordModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                onPress={confirmPasswordChange}
              >
                <Text style={{ color: "#fff" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔹 Delete Account Modal */}
      <Modal transparent visible={showDeleteModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalDesc}>
              Enter your password to permanently delete your account.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ff4d4d" }]}
                onPress={confirmDelete}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  profileCard: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  profilePic: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  profileEmail: { fontSize: 14, color: "gray" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingText: { fontSize: 16 },
  actionBtn: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  actionText: { fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalDesc: { fontSize: 16, color: "gray", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
