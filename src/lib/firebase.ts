import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "ramplink-3151a",
  storageBucket: "ramplink-3151a.appspot.com",
  apiKey: "AIzaSyCkooZMgcDWg-_KMSDnBmg1oYRtRtERmPs",
  authDomain: "ramplink-3151a.firebaseapp.com",
  appId: "1:1068230064402:web:6352ee474c3cf5a51f1bcb",
  messagingSenderId: "1068230064402",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

    