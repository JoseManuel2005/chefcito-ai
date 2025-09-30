// import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "./firebaseClient";
// import { User } from "firebase/auth";

// export async function saveUserProfile(user: User) {
//   if (!user) return { user: null, isNew: false };

//   const userRef = doc(db, "users", user.uid);
//   const snap = await getDoc(userRef);

//   const isNew = !snap.exists();

//   // Si es nuevo, inicializamos también el campo termsAcceptedAt
//   await setDoc(
//     userRef,
//     {
//       uid: user.uid,
//       email: user.email,
//       emailVerified: user.emailVerified,
//       displayName: user.displayName,
//       photoURL: user.photoURL,
//       createdAt: serverTimestamp(),
//       lastLoginAt: serverTimestamp(),
//       ...(isNew && { termsAcceptedAt: serverTimestamp() }), // 👈 solo si es nuevo
//     },
//     { merge: true }
//   );

//   return { user, isNew };
// }


import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseClient";
import { User } from "firebase/auth";

export async function saveUserProfile(user: User) {
  if (!user) return { user: null, isNew: false };

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const isNew = !snap.exists();

  if (isNew) {
    // 👉 Primera vez → creamos documento completo
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),     // solo la primera vez
      termsAcceptedAt: serverTimestamp(), // solo la primera vez
      lastLoginAt: serverTimestamp(),   // también en primer login
    });
  } else {
    // 👉 Ya existe → solo actualizamos datos dinámicos
    await updateDoc(userRef, {
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp(), // siempre en cada login
    });
  }

  return { user, isNew };
}

