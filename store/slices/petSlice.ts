// store/slices/petSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Pet } from "../../types/pet";

type State = {
  items: Pet[];
  loading: boolean;
  error?: string | null;
};

const initialState: State = { items: [], loading: false, error: null };

export const fetchPets = createAsyncThunk<Pet[], { uid: string }>(
  "pets/fetch",
  async ({ uid }) => {
    const col = collection(db, "users", uid, "pets");
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data: Pet[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pet, "id">) }));
    return data;
  }
);

export const addPet = createAsyncThunk<Pet, { uid: string; data: Omit<Pet, "id" | "createdAt" | "updatedAt"> }>(
  "pets/add",
  async ({ uid, data }) => {
    const now = Date.now();
    const col = collection(db, "users", uid, "pets");
    const ref = await addDoc(col, { ...data, createdAt: now, updatedAt: now });
    const pet: Pet = { id: ref.id, ...(data as any), createdAt: now, updatedAt: now };
    return pet;
  }
);

export const updatePet = createAsyncThunk<Pet, { uid: string; id: string; data: Partial<Pet> }>(
  "pets/update",
  async ({ uid, id, data }) => {
    const now = Date.now();
    const ref = doc(db, "users", uid, "pets", id);
    await updateDoc(ref, { ...data, updatedAt: now });
    return { id, ...(data as any), updatedAt: now } as Pet;
  }
);

export const deletePet = createAsyncThunk<string, { uid: string; id: string }>(
  "pets/delete",
  async ({ uid, id }) => {
    const ref = doc(db, "users", uid, "pets", id);
    await deleteDoc(ref);
    return id;
  }
);

const slice = createSlice({
  name: "pets",
  initialState,
  reducers: {
    clearPets: (s) => { s.items = []; s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchPets.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchPets.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchPets.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "Failed to load pets"; })

     .addCase(addPet.fulfilled, (s, a) => { s.items.unshift(a.payload); })
     .addCase(updatePet.fulfilled, (s, a) => {
        s.items = s.items.map(p => p.id === a.payload.id ? { ...p, ...a.payload } : p);
     })
     .addCase(deletePet.fulfilled, (s, a) => {
        s.items = s.items.filter(p => p.id !== a.payload);
     });
  }
});

export const { clearPets } = slice.actions;
export default slice.reducer;
