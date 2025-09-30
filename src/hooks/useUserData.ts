// hooks/useUserData.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface UserPreferences {
  allergies: string[];
  preferredCuisines: string[];
  country: string;
}

export interface UserData {
  userPhoto: string | null;
  userPreferences: UserPreferences | null;
  isLoading: boolean;
}

export function useUserData(redirectToLogin: boolean = true): UserData {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    userPhoto: null,
    userPreferences: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario está logueado
        setUserData(prev => ({ ...prev, userPhoto: user.photoURL }));

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(prev => ({
              ...prev,
              userPreferences: {
                allergies: data.allergies || [],
                preferredCuisines: data.preferredCuisines || [],
                country: data.country || "",
              },
            }));
          }
        } catch (error) {
          console.error("Error al cargar preferencias del usuario:", error);
        }
      } else if (redirectToLogin) {
        // Usuario no está logueado, redirigir al login
        //router.push("/login");
      }
      
      setUserData(prev => ({ ...prev, isLoading: false }));
    });

    return () => unsubscribe();
  }, [router, redirectToLogin]);

  return userData;
}