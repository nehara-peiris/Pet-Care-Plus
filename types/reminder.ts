// types/reminder.ts
export type Reminder = {
  id: string;
  petId: string;
  type: "vaccine" | "med" | "groom" | "walk" | "vet" | "other";
  title: string;
  date: number;            // next due timestamp
  repeat?: "none" | "daily" | "weekly" | "monthly";
  done?: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};
