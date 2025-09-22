"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function OnboardingPage() {
  const [allergies, setAllergies] = useState<string[]>([""]);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const router = useRouter();

  // Agregar un nuevo input de alergia
  const handleAddAllergyInput = () => {
    setAllergies([...allergies, ""]);
  };

  // Cambiar valor de un input de alergia
  const handleChangeAllergy = (value: string, index: number) => {
    const updated = [...allergies];
    updated[index] = value;
    setAllergies(updated);
  };

  // Toggle para tipos de cocina
  const handleToggleCuisine = (cuisine: string) => {
    setPreferredCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  // Guardar datos en Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        allergies: allergies.filter((a) => a.trim() !== ""),
        preferredCuisines,
        country,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    router.push("/ejemploInicio"); // redirige al home
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h1 className="text-2xl font-bold text-yellow-700">
          Configura tu perfil
        </h1>

        {/* Alergias */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Alergias
          </label>
          {allergies.map((value, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChangeAllergy(e.target.value, index)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Ej: maní"
              />
              <button
                type="button"
                onClick={() =>
                  setAllergies(allergies.filter((_, i) => i !== index))
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                -
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAllergyInput}
            className="bg-yellow-500 text-white px-3 py-1 rounded-full text-lg"
          >
            +
          </button>
        </div>

        {/* Tipos de cocina */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">
            Tipo de cocina preferida
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              "Italiana",
              "Japonesa",
              "Mexicana",
              "Colombiana",
              "Española",
              "Francesa",
              "China",
              "India",
              "Árabe",
              "Mediterránea",
              "Estadounidense",
              "Vegana",
            ].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => handleToggleCuisine(c)}
                className={`px-4 py-2 rounded border ${
                  preferredCuisines.includes(c)
                    ? "bg-yellow-500 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* País */}
        <div>
          <label className="block font-semibold text-gray-900 mb-2">País</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Selecciona tu país</option>
            <option value="Colombia">Colombia</option>
            <option value="México">México</option>
            <option value="España">España</option>
            <option value="Argentina">Argentina</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
        >
          Guardar perfil
        </button>
      </form>
    </main>
  );
}
