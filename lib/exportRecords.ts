import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, auth } from "./firebase";

export async function exportRecords(scope: "user" | "pet", petId?: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in.");

    // 🔹 Build Firestore query
    let q;
    if (scope === "user") {
      q = query(collection(db, "records"), where("userId", "==", user.uid));
    } else if (scope === "pet" && petId) {
      q = query(collection(db, "records"), where("petId", "==", petId));
    } else {
      throw new Error("Invalid export scope.");
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("No records found.");

    const zip = new JSZip();

    // 🔹 Download each file & add to zip
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const url = data.fileUrl;
      if (!url) continue;

      const fileName = `${data.title || "record"}_${doc.id}${
        url.endsWith(".pdf") ? ".pdf" : ".jpg"
      }`;

      const localPath = FileSystem.cacheDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(url, localPath);
      const fileData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      zip.file(fileName, fileData, { base64: true });
    }

    // 🔹 Generate ZIP
    const content = await zip.generateAsync({ type: "base64" });
    const zipUri = FileSystem.documentDirectory + "records_export.zip";
    await FileSystem.writeAsStringAsync(zipUri, content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 🔹 Share ZIP
    await Sharing.shareAsync(zipUri, {
      mimeType: "application/zip",
      dialogTitle: "Exported Medical Records",
    });
  } catch (err: any) {
    throw new Error(err.message || "Export failed.");
  }
}
