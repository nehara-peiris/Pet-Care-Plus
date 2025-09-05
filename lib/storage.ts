// lib/storage.ts
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadImageAsync(uri: string, path: string): Promise<string> {
  const resp = await fetch(uri);
  const blob = await resp.blob();

  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, blob);

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      // progress handler (optional)
      () => {},
      // error handler
      (err) => reject(err),
      // complete handler (no args)
      () => resolve()
    );
  });

  return await getDownloadURL(storageRef);
}
