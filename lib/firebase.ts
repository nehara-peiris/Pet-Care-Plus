import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxp7tRj1kzGpQG0SQGydZMN6lvUBvYkZY",
  authDomain: "petcareplus-d2bbc.firebaseapp.com",
  projectId: "petcareplus-d2bbc",
  storageBucket: "petcareplus-d2bbc.appspot.com",
  messagingSenderId: "705850893246",
  appId: "1:705850893246:web:f6b47ca0a33bc032c34fef",
};

const app = initializeApp(firebaseConfig);

// 👇 Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
