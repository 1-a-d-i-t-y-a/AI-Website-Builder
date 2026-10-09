import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-website-builder-ea728.firebaseapp.com",
  projectId: "ai-website-builder-ea728",
  storageBucket: "ai-website-builder-ea728.firebasestorage.app",
  messagingSenderId: "344973955613",
  appId: "1:344973955613:web:efb39a3f0b534a687a6cf4",
  measurementId: "G-LTVD334P6V"
};

const app = initializeApp(firebaseConfig);
const auth= getAuth(app)
const provider=new GoogleAuthProvider()

export {auth,provider}
