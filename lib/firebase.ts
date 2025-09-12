import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
