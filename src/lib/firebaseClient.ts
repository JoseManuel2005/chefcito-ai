import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { saveUserProfile } from "./firebaseUser"; // 👈 import del helper

// --- Config ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- Init ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// --- Métodos ---
// export async function signInWithGoogle() {
//   await setPersistence(auth, browserLocalPersistence);
//   const result = await signInWithPopup(auth, googleProvider);

//   // Guardar/actualizar perfil
//   await saveUserProfile(result.user);

//   return result.user;
// }

export async function signInWithGoogle() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);

    // Guardar/actualizar perfil y obtener si es nuevo
    const { isNew } = await saveUserProfile(result.user);

    return { user: result.user, isNew, error: null };
  } catch (err: any) {
    return { user: null, isNew: false, error: err.code || "auth/unknown-error" };
  }
}


export async function signOut() {
  await firebaseSignOut(auth);
}









