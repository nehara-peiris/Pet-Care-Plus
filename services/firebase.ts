import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAGh4ibNQ4Cp0bzstyJyzYj-vm4ZAW-K8w",
  authDomain: "petcareplus-849cd.firebaseapp.com",
  projectId: "petcareplus-849cd",
  storageBucket: "petcareplus-849cd.appspot.com",
  messagingSenderId: "1044978912698",
  appId: "1:1044978912698:web:893c9243f2e245964d6183",
  measurementId: "G-26BWPDWN8R",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);
export { app, auth, db, storage };
