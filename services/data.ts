import type { Pet } from "@/types/pet";

export const demoPets: Pet[] = [
  {
    id: "1",
    name: "Snow",
    species: "Cat",
    breed: "Persian",
    weightKg: 4.2,
    avatarUrl: "https://placekitten.com/200/200",
    vaccinations: [{ name: "Rabies", date: "2024-11-10" }],
    nextVetVisit: "2025-10-01",
  },
  {
    id: "2",
    name: "Rex",
    species: "Dog",
    breed: "Labrador",
    weightKg: 22.5,
    avatarUrl: "https://place.dog/200/200",
    vaccinations: [{ name: "DHPPiL", date: "2025-06-12" }],
    nextVetVisit: "2025-09-20",
  },
];
