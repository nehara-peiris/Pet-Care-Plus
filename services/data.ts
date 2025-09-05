import type { Pet } from "@/types/pet";
import { Record } from "@/types/record";
import { Reminder } from "@/types/reminder";

export const demoPets: Pet[] = [
  {
    id: "1",
    name: "Snow",
    species: "Cat",
    breed: "Persian",
    weight: 4.2,
    photoUrl: "https://placekitten.com/200/200",
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
  {
    id: "2",
    name: "Rex",
    species: "Dog",
    breed: "Labrador",
    weight: 22.5,
    photoUrl: "https://place.dog/200/200",
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  },
];

export const demoRecords: Record[] = [
    {
        id: "1",
        petId: "1",
        title: "Vet Visit",
        fileUrl: "",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
    },
    {
        id: "2",
        petId: "2",
        title: "Vet Visit",
        fileUrl: "",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
    }
]

export const demoReminders: Reminder[] = [
    {
        id: "1",
        petId: "1",
        title: "Give medicine",
        type: "med",
        date: new Date().getTime(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
    },
    {
        id: "2",
        petId: "2",
        title: "Go for a walk",
        type: "walk",
        date: new Date().getTime(),
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
    }
]
