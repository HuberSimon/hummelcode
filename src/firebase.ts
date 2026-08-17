import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDO5uIkubENmEjpEutzYhm9kB7HjYU8lKI",
  authDomain: "hummelcode-7a6b5.firebaseapp.com",
  projectId: "hummelcode-7a6b5",
  storageBucket: "hummelcode-7a6b5.firebasestorage.app",
  messagingSenderId: "349794717204",
  appId: "1:349794717204:web:7c1777deb799c2d5c92101"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);