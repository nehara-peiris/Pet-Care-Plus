// lib/firebase.ts
import { Platform } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// AsyncStorage only used on native
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

function initAuth(): Auth {
  // Web: normal getAuth + browser persistence
  if (Platform.OS === "web") {
    const a = getAuth(app);
    setPersistence(a, browserLocalPersistence);
    return a;
  }

  // Native: try to use RN persistence (without importing its types at top level)
  let getReactNativePersistence: ((storage: unknown) => any) | null = null;
  try {
    // This path exists on RN; on Web it will throw (we’re not here on web anyway)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    getReactNativePersistence =
      require("firebase/auth/react-native").getReactNativePersistence;
  } catch {
    getReactNativePersistence = null;
  }

  try {
    if (getReactNativePersistence) {
      return initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    }
    // fallback if the helper isn’t available on your installed version
    return getAuth(app);
  } catch {
    // if Auth already initialized, just return it
    return getAuth(app);
  }
}

const auth = initAuth();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
