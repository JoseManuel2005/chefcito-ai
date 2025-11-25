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
  Croissant,
  Hamburger,
  Leaf,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ParticleBackground from "@/components/ParticleBackground";
import Tooltip from "@/components/Tooltip";

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
          const data = userDoc.data() as { allergies?: string[]; preferredCuisines?: string[]; country?: string };

          // Alergias
          const existingAllergies = data.allergies ?? [""];
          setAllergies(existingAllergies.length > 0 ? existingAllergies : [""]);

          // Cocinas predefinidas y personalizadas
          const allCuisines: string[] = data.preferredCuisines ?? [];
          const predefined = cuisines.map((c) => c.name);
          const existingPredefined = allCuisines.filter((c) => predefined.includes(c));
          const existingCustom = allCuisines.filter((c) => !predefined.includes(c));

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
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300 background-grid">
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
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden relative">
      <ParticleBackground theme={theme} dependencies={[loading]} />
      <div className="w-full max-w-md relative">
        {/* Fondo suave estilo partículas o glow (opcional si usas ParticleBackground global) */}
        {/* <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100/30 via-transparent to-yellow-50/20 dark:from-amber-900/10 dark:to-yellow-900/5 blur-3xl rounded-[3rem]" /> */}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-yellow-300 mb-5 shadow-lg shadow-amber-500/30 dark:shadow-amber-900/30">
            <ChefHat className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
            Configura tu perfil
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Personaliza tu experiencia para recibir recomendaciones a tu medida
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step
                    ? "bg-gradient-to-br from-amber-500 to-yellow-300 text-white shadow-md shadow-amber-500/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 h-0.5 transition-colors ${currentStep > step
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                      : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card - Glass + Glow */}
        <div className="relative rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-lg backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300">
          {/* Glow interno sutil */}
          <div className="pointer-events-none absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-yellow-400/20 via-amber-200/10 to-transparent blur-3xl opacity-70 dark:from-yellow-500/20 dark:via-amber-300/10" />

          <form onSubmit={handleSubmit} className="relative">
            {/* Step 1: Alergias */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="mt-0.5 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Alergias alimentarias
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ayúdanos a mantenerte seguro
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {allergies.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChangeAllergy(e.target.value, index)}
                        className="flex-1 px-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        placeholder="Ej: maní, lactosa, gluten..."
                      />
                      {allergies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(index)}
                          className="p-2.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10 dark:hover:bg-red-400/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddAllergyInput}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-amber-300 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center justify-center gap-2 bg-white/70 dark:bg-gray-800/60"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar alergia
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 py-3 px-5 text-sm font-bold text-gray-900 shadow-lg shadow-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Tipos de cocina */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="mt-0.5 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Utensils className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Preferencias culinarias
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Elige los estilos que más disfrutas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {cuisines.map((cuisine) => {
                    const IconComponent = cuisine.icon;
                    const isSelected = preferredCuisines.includes(cuisine.name);

                    return (
                      <button
                        type="button"
                        key={cuisine.name}
                        onClick={() => handleToggleCuisine(cuisine.name)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${isSelected
                          ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 shadow-sm shadow-amber-500/20"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-gray-50/80 dark:hover:bg-gray-800/60"
                          }`}
                      >
                        <IconComponent className="w-6 h-6" />
                        <span className="text-sm font-medium">{cuisine.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Personalizadas */}
                <div className="space-y-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/70">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    ¿No ves tu favorita? Escríbela:
                  </p>

                  <div className="space-y-3">
                    {customCuisines.map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleChangeCustomCuisine(e.target.value, index)}
                          className="flex-1 px-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Ej: Peruana, Fusión coreana..."
                        />
                        {customCuisines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomCuisine(index)}
                            className="p-2.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full hover:bg-red-500/10 dark:hover:bg-red-400/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddCustomCuisineInput}
                      className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-amber-300 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center justify-center gap-2 bg-white/70 dark:bg-gray-800/60"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar otra
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 py-3 px-5 text-sm font-bold text-gray-900 shadow-lg shadow-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: País */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="mt-0.5 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Tu ubicación
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Para recetas adaptadas a tu región
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent cursor-pointer"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">
                      Selecciona tu país
                    </option>
                    {countries.map((countryOption) => (
                      <option key={countryOption} value={countryOption}>
                        {countryOption}
                      </option>
                    ))}
                  </select>
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-1" />
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={!country}
                    className="flex-1 group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 py-3 px-5 text-sm font-bold text-gray-900 shadow-lg shadow-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Botón de tema */}
        <div className="flex justify-center mt-8">
          <Tooltip content={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'} colorClass="bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-800">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full hover:bg-white/80 dark:hover:bg-gray-900/80 backdrop-blur-sm border border-white/60 dark:border-gray-800/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 group cursor-pointer"
              aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6 text-gray-700 dark:text-amber-200 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-6 h-6 text-amber-600 dark:text-amber-300 group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </main>
  );
}