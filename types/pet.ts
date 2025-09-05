// types/pet.ts
export type Pet = {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  sex?: "Male" | "Female" | "Unknown";
  dob?: number | null;
  weight?: number | null;
  photoUrl?: string | null;
  createdAt: number;
  updatedAt: number;
};
