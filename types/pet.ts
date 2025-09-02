export type Pet = {
  id: string;
  name: string;
  species: "dog" | "cat" | "other";
  dob?: string; 
  avatarUri?: string;
};
