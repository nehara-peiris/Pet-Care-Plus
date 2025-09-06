// components/Forms/ReminderForm.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { addReminder, updateReminder } from "../../store/slices/reminderSlice";
import type { Reminder } from "../../types/reminder";
import { scheduleLocal } from "../../lib/notifications"; // ensure this helper exists

type Props = {
  mode: "create" | "edit";
  petId: string;
  initial?: Reminder;
  onDone?: () => void;
};

export default function ReminderForm({ mode, petId, initial, onDone }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((s: RootState) => s.auth.user?.uid) as string;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<Reminder["type"]>(initial?.type ?? "other");
  const [date, setDate] = useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 16) : ""
  ); // YYYY-MM-DDTHH:mm
  const [repeat, setRepeat] = useState<Reminder["repeat"]>(initial?.repeat ?? "none");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !date) {
      Alert.alert("Missing info", "Please provide a title and a date/time.");
      return;
    }
    const when = new Date(date).getTime();
    if (Number.isNaN(when)) {
      Alert.alert("Invalid date", "Please enter a valid date/time.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        const payload = {
          petId,
          title: title.trim(),
          type,
          date: when,
          repeat,
          notes: initial?.notes ?? "",
        } as Omit<Reminder, "id" | "createdAt" | "updatedAt" | "done">;

        const created = await dispatch(addReminder({ uid, data: payload })).unwrap();

        // schedule local notification
        await scheduleLocal(when, "PetCare+ Reminder", `${created.title} for your pet`);
      } else {
        const patch: Partial<Reminder> = {
          title: title.trim(),
          type,
          date: when,
          repeat,
        };
        await dispatch(updateReminder({ uid, id: initial!.id, data: patch })).unwrap();

        await scheduleLocal(when, "PetCare+ Reminder", `${patch.title ?? initial!.title}`);
      }
      onDone?.();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-3">
      <Text className="text-neutral-300">Title</Text>
      <TextInput
        className="bg-neutral-900 rounded-2xl px-4 py-3 text-white"
        value={title}
        onChangeText={setTitle}
        placeholder="Rabies vaccine / Deworming"
        placeholderTextColor="#777"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-neutral-300">Type</Text>
          <TextInput
            className="bg-neutral-900 rounded-2xl px-4 py-3 text-white"
            value={type}
            onChangeText={(t) => setType((t as any) || "other")}
            placeholder="vaccine / med / walk / vet / groom / other"
            placeholderTextColor="#777"
          />
        </View>
        <View className="flex-1">
          <Text className="text-neutral-300">Repeat</Text>
          <TextInput
            className="bg-neutral-900 rounded-2xl px-4 py-3 text-white"
            value={repeat}
            onChangeText={(t) => setRepeat((t as any) || "none")}
            placeholder="none / daily / weekly / monthly"
            placeholderTextColor="#777"
          />
        </View>
      </View>

      <Text className="text-neutral-300">Date & Time (local)</Text>
      <TextInput
        className="bg-neutral-900 rounded-2xl px-4 py-3 text-white"
        value={date}
        onChangeText={setDate}
        placeholder="2025-09-06T10:30"
        placeholderTextColor="#777"
      />

      <Pressable
        onPress={submit}
        disabled={loading}
        className="bg-teal-500 rounded-2xl py-3 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-black font-semibold">
            {mode === "create" ? "Add reminder" : "Save changes"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
