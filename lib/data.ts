// lib/data.ts
import { auth, db, storage } from "@/lib/firebase";
import {
  addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/* ---------- PETS ---------- */
export type NewPet = {
  name: string;
  species?: string;
  breed?: string;
  dob?: string;        // ISO
  weight?: number;     // kg
  avatarUri?: string | null; // local file URI from ImagePicker
};

export async function savePet(pet: NewPet) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  let avatarUrl: string | null = null;

  if (pet.avatarUri) {
    const res = await fetch(pet.avatarUri);
    const blob = await res.blob();
    const key = `pets/${user.uid}/${Date.now()}-${(pet.name || "pet")
      .replace(/\s+/g, "_")}.jpg`;
    const fileRef = ref(storage, key);
    await uploadBytes(fileRef, blob);
    avatarUrl = await getDownloadURL(fileRef);
  }

  const col = collection(db, "users", user.uid, "pets");
  const docRef = await addDoc(col, {
    name: pet.name.trim(),
    species: pet.species ?? null,
    breed: pet.breed ?? null,
    dob: pet.dob ?? null,
    weight: pet.weight ?? null,
    avatarUrl,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function listPetsOnce() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db, "users", user.uid, "pets"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function onPetsSnapshot(cb: (items: any[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const q = query(collection(db, "users", user.uid, "pets"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/* ---------- TASKS ---------- */
export type NewTask = {
  petId: string;
  type: "feeding" | "walk" | "meds" | "groom" | "vaccination" | "deworm";
  time: string; // "08:00"
  repeat: "daily" | "weekly" | "monthly";
  notes?: string;
  nextAt?: string; // ISO
};

export async function saveTask(task: NewTask) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const col = collection(db, "users", user.uid, "tasks");
  const docRef = await addDoc(col, {
    ...task,
    notes: task.notes ?? null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/* ---------- APPOINTMENTS ---------- */
export type NewAppointment = {
  petId: string;
  date: string;   // ISO
  clinic?: string;
  reason?: string;
  remind?: boolean;
};

export async function saveAppointment(a: NewAppointment) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const col = collection(db, "users", user.uid, "appointments");
  const docRef = await addDoc(col, {
    ...a,
    clinic: a.clinic ?? null,
    reason: a.reason ?? null,
    remind: !!a.remind,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
