// store/slices/reminderSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, updateDoc, doc, deleteDoc, where } from "firebase/firestore";
import type { Reminder } from "../../types/reminder";

type State = {
  items: Reminder[];
  loading: boolean;
  error?: string | null;
};
const initialState: State = { items: [], loading: false, error: null };

export const fetchReminders = createAsyncThunk<Reminder[], { uid: string; petId?: string }>(
  "reminders/fetch",
  async ({ uid, petId }) => {
    const col = collection(db, "users", uid, "reminders");
    const q = petId
      ? query(col, where("petId", "==", petId), orderBy("date", "asc"))
      : query(col, orderBy("date", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reminder, "id">) }));
  }
);

export const addReminder = createAsyncThunk<
  Reminder,
  { uid: string; data: Omit<Reminder, "id" | "createdAt" | "updatedAt" | "done"> }
>("reminders/add", async ({ uid, data }) => {
  const now = Date.now();
  const col = collection(db, "users", uid, "reminders");
  const ref = await addDoc(col, { ...data, done: false, createdAt: now, updatedAt: now });
  return { id: ref.id, ...(data as any), done: false, createdAt: now, updatedAt: now };
});

export const updateReminder = createAsyncThunk<
  Reminder,
  { uid: string; id: string; data: Partial<Reminder> }
>("reminders/update", async ({ uid, id, data }) => {
  const now = Date.now();
  const ref = doc(db, "users", uid, "reminders", id);
  await updateDoc(ref, { ...data, updatedAt: now });
  return { id, ...(data as any), updatedAt: now } as Reminder;
});

export const deleteReminder = createAsyncThunk<string, { uid: string; id: string }>(
  "reminders/delete",
  async ({ uid, id }) => {
    await deleteDoc(doc(db, "users", uid, "reminders", id));
    return id;
  }
);

const slice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    clearReminders: (s) => { s.items = []; s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchReminders.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchReminders.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchReminders.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Failed to load reminders"; })

     .addCase(addReminder.fulfilled, (s, a) => { s.items.unshift(a.payload); })
     .addCase(updateReminder.fulfilled, (s, a) => {
       s.items = s.items.map(r => r.id === a.payload.id ? { ...r, ...a.payload } : r);
     })
     .addCase(deleteReminder.fulfilled, (s, a) => {
       s.items = s.items.filter(r => r.id !== a.payload);
     });
  }
});

export const { clearReminders } = slice.actions;
export default slice.reducer;
