import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "petcareplus:data";

export async function saveData<T>(data: T) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
export async function loadData<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}
