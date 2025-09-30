"use client";

import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, signOut } from "@/lib/firebaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        {user ? (
          <>
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800">
              {user.displayName || "Usuario sin nombre"}
            </h2>
            <p className="text-gray-600 mb-6">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <p className="text-gray-500">Cargando usuario...</p>
        )}
      </div>
    </main>
  );
}
