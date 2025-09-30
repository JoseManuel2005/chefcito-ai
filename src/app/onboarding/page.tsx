"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  ChefHat, Plus, X,
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  AlertTriangle,
  Utensils,
  MapPin,
  Pizza,
  Fish,
  Rat,
  Coffee,
  Apple,
  Wheat,
  Soup,
  Salad,
  Beef,
  Croissant,
  Hamburger,
  Leaf,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function OnboardingPage() {
  const [allergies, setAllergies] = useState<string[]>([""]);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [customCuisines, setCustomCuisines] = useState<string[]>([""]);
  const [country, setCountry] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // 👇 Cargar datos existentes al montar
  useEffect(() => {
    const loadExistingData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Alergias
          const existingAllergies = data.allergies || [""];
          setAllergies(existingAllergies.length > 0 ? existingAllergies : [""]);

          // Cocinas predefinidas y personalizadas
          const allCuisines = data.preferredCuisines || [];
          const predefined = cuisines.map(c => c.name);
          const existingPredefined = allCuisines.filter(c => predefined.includes(c));
          const existingCustom = allCuisines.filter(c => !predefined.includes(c));

          setPreferredCuisines(existingPredefined);
          setCustomCuisines(existingCustom.length > 0 ? existingCustom : [""]);

          // País
          setCountry(data.country || "");
        }
      } catch (error) {
        console.error("Error al cargar datos existentes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [router]);

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

  // Eliminar input de alergia
  const handleRemoveAllergy = (index: number) => {
    if (allergies.length > 1) {
      setAllergies(allergies.filter((_, i) => i !== index));
    }
  };

  // Toggle para tipos de cocina
  const handleToggleCuisine = (cuisine: string) => {
    setPreferredCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  // Agregar un nuevo input de preferencia personalizada
  const handleAddCustomCuisineInput = () => {
    setCustomCuisines([...customCuisines, ""]);
  };

  // Cambiar valor de un input de preferencia personalizada
  const handleChangeCustomCuisine = (value: string, index: number) => {
    const updated = [...customCuisines];
    updated[index] = value;
    setCustomCuisines(updated);
  };

  // Eliminar input de preferencia personalizada
  const handleRemoveCustomCuisine = (index: number) => {
    if (customCuisines.length > 1) {
      setCustomCuisines(customCuisines.filter((_, i) => i !== index));
    }
  };

  // Guardar datos en Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Combinar preferencias predefinidas y personalizadas
    const validCustomCuisines = customCuisines.filter((c) => c.trim() !== "");
    const allPreferredCuisines = [...preferredCuisines, ...validCustomCuisines];

    await setDoc(
      doc(db, "users", user.uid),
      {
        allergies: allergies.filter((a) => a.trim() !== ""),
        preferredCuisines: allPreferredCuisines,
        country,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    router.push("/home");
  };

  const cuisines = [
    { name: "Italiana", icon: Pizza },
    { name: "Japonesa", icon: Fish },
    { name: "Mexicana", icon: Soup },
    { name: "Colombiana", icon: Coffee },
    { name: "Española", icon: Apple },
    { name: "Francesa", icon: Croissant },
    { name: "China", icon: Utensils },
    { name: "India", icon: Rat },
    { name: "Árabe", icon: Wheat },
    { name: "Mediterránea", icon: Salad },
    { name: "Estadounidense", icon: Hamburger },
    { name: "Vegana", icon: Leaf },
  ];

  const countries = [
    "Colombia",
    "México",
    "España",
    "Argentina",
    "Perú",
    "Chile",
    "Ecuador",
    "Venezuela"
  ];

  // 👇 Agrega un estado de loading al inicio
  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-4xl mb-5">
            <ChefHat className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-12">

          <div className="inline-flex mr-5 items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-4xl mb-5">
            <ChefHat className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Configura tu perfil
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia para recibir las mejores recomendaciones
          </p>

        </div>


        {/* Progress */}
        <div className="mb-8">

          <div className="flex items-center justify-center mb-4">

            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 h-px mx-2 transition-colors ${currentStep > step ? "bg-yellow-400" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                )}
              </div>

            ))}
          </div>
        </div>

        {/* Form Card */}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Alergias */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-7 h-7 mr-2 text-yellow-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Alergias alimentarias
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ayúdanos a mantenerte seguro
                    </p>
                  </div>

                </div>

                <div className="space-y-3">
                  {allergies.map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChangeAllergy(e.target.value, index)}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Ej: maní, lactosa, gluten..."
                      />
                      {allergies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(index)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddAllergyInput}
                    className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 cursor-cell"
                  >

                    <Plus className="w-4 h-4" />
                    Agregar alergia
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 dark:text-gray-800 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Tipos de cocina */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Utensils className="w-7 h-7 mr-2 text-yellow-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Preferencias culinarias
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selecciona los tipos de cocina que más te gusten
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisines.map((cuisine) => {
                    const IconComponent = cuisine.icon;
                    const isSelected = preferredCuisines.includes(cuisine.name);

                    return (
                      <button
                        type="button"
                        key={cuisine.name}
                        onClick={() => handleToggleCuisine(cuisine.name)}
                        className={`p-4 rounded-lg border transition-all ${isSelected
                          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 cursor-pointer"
                          : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-200 dark:hover:border-yellow-500 cursor-pointer"
                          }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{cuisine.name}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Preferencias culinarias personalizadas */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ¿No encuentras tu tipo de cocina favorito? Escríbelo aquí:
                  </div>

                  <div className="space-y-3">
                    {customCuisines.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleChangeCustomCuisine(e.target.value, index)}
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Ej: Tailandesa, Peruana, Fusión..."
                        />
                        {customCuisines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomCuisine(index)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddCustomCuisineInput}
                      className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar otra preferencia
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-lg dark:text-gray-800 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: País */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-7 h-7 text-yellow-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Tu ubicación
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Para sugerirte recetas locales
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 text-black dark:text-white rounded-lg focus:ring-1 focus:border-yellow-400 focus:ring-yellow-400 transition-colors focus:outline-none appearance-none bg-white dark:bg-gray-700 cursor-pointer"
                  >
                    <option value="">Selecciona tu país</option>
                    {countries.map((countryOption) => (
                      <option key={countryOption} value={countryOption}>
                        {countryOption}
                      </option>
                    ))}
                  </select>
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={!country}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 dark:text-gray-800 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </form>

        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            {theme === 'light' ? (
              <Moon className="w-10 h-8 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-10 h-8 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

    </main>
  );
}