export type Vaccination = { name: string; date: string; fileUri?: string };
export type Pet = {
  id: string; name: string; species: 'Dog'|'Cat'|'Bird'|'Other';
  breed?: string; dobIso?: string; weightKg?: number; avatarUri?: string;
  vaccinations?: Vaccination[]; nextVetVisit?: string;
};
