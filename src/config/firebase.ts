// Firebase configuration for Nexus Syndicate
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9GlsE_aoHdmlHVDwu90VAjXwfj9f7mro",
  authDomain: "nexus-syndicate.firebaseapp.com",
  projectId: "nexus-syndicate",
  storageBucket: "nexus-syndicate.firebasestorage.app",
  messagingSenderId: "164124649148",
  appId: "1:164124649148:web:560ba9e142b01617afd2b9",
  measurementId: "G-ZY4DS0XV0R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };

