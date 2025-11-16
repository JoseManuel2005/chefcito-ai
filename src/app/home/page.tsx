"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  BookOpen,
  ChefHat,
  ArrowRight,
  Heart,
  Settings,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useTheme } from "@/contexts/ThemeContext";
import ParticleBackground from "@/components/ParticleBackground";

export default function HomePage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const { favorites, isLoadingFavorites } = useFavoriteRecipes();
  const { theme, toggleTheme } = useTheme();

  const mainRef = useRef<HTMLElement | null>(null);
  const favoritesCount = Array.from(favorites.values()).length;
  const hasPreferences =
    !!userPreferences &&
    ((userPreferences.preferredCuisines?.length ?? 0) > 0 ||
      (userPreferences.allergies?.length ?? 0) > 0 ||
      !!userPreferences.country);

  // Track mouse (por si luego quieres tilt/animaciones)
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <main
        ref={mainRef}
        className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${theme === "dark"
          ? "dark bg-gray-950"
          : "bg-white"
          }`}
      >
        {/* Canvas de partículas */}
        <ParticleBackground theme={theme} dependencies={[isLoading, favoritesCount, hasPreferences]} />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar userPhoto={userPhoto} />
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 blur-md opacity-70 animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-slate-900 rounded-full shadow-lg">
                  <ChefHat className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Preparando tu cocina inteligente...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainRef}
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${theme === "dark"
        ? "dark bg-gray-950"
        : "bg-white"
        }`}
    >
      {/* Canvas de partículas */}
      <ParticleBackground theme={theme} dependencies={[isLoading, favoritesCount, hasPreferences]} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar userPhoto={userPhoto} />

        <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-6xl mx-auto space-y-10 lg:space-y-12">
            {/* HERO */}
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
              {/* Texto principal */}
              <div>
                {/* Badge estilo login */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-gray-900 shadow-md backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/80 dark:text-gray-100 mb-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-amber-300 dark:bg-gray-800">
                    <ChefHat className="h-3 w-3" />
                  </div>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                    Chefcito AI · Tu cocina inteligente
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                  Cocina mejor,
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300">
                    con lo que ya tienes.
                  </span>
                </h1>

                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base max-w-xl mb-6">
                  Chefcito AI transforma los ingredientes de tu nevera en recetas
                  reales, y desarma cualquier receta para mostrarte exactamente qué
                  necesitas. Menos duda, más sabor.
                </p>

                {/* Botones principales (armonizados con login) */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => handleNavigation("/ingredients")}
                    className="group inline-flex items-center gap-2 rounded-full bg-gray-900/95 px-5 py-2.5 text-sm font-semibold text-amber-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all dark:bg-gray-900 cursor-pointer"
                  >
                    <Utensils className="h-4 w-4" />
                    Ingredientes → Recetas
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleNavigation("/recipe-analysis")}
                    className="group inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg hover:shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all dark:bg-gray-900/90 dark:text-green-200 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    Receta → Análisis
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Mini stats */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    <span>
                      {favoritesCount > 0
                        ? `${favoritesCount}+ recetas favoritas guardadas`
                        : "Empieza guardando tus primeras recetas favoritas"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                    <span>
                      Preferencias{" "}
                      {hasPreferences
                        ? "configuradas a tu gusto"
                        : "listas para personalizar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta lateral usuario (estilo glass + glow como login) */}
              <div className="relative">
                <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-yellow-400/25 via-amber-200/10 to-transparent blur-3xl opacity-80 dark:from-yellow-500/25 dark:via-amber-300/10 dark:to-transparent" />
                <div className="relative rounded-[2.5rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 sm:p-7 space-y-5">
                  {/* User chip */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-gray-900 text-sm font-bold overflow-hidden">
                        {userPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={userPhoto}
                            alt="Foto de usuario"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ChefHat className="h-5 w-5" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Perfil culinario
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {userPreferences?.country || "Cocinero curioso"}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/onboarding")}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-[11px] font-medium text-amber-200 hover:bg-gray-800 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-3 w-3" />
                      Ajustar
                    </button>
                  </div>

                  {/* Info rápida */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <StatPill
                      label="Cocinas"
                      value={userPreferences?.preferredCuisines?.length ?? 0}
                    />
                    <StatPill
                      label="Alergias"
                      value={userPreferences?.allergies?.length ?? 0}
                    />
                    <StatPill label="Favoritos" value={favoritesCount} />
                  </div>

                  {/* País + recordatorio */}
                  <div className="flex items-start justify-between gap-3 border-t border-gray-200/70 pt-4 text-xs dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50/80 dark:bg-gray-800">
                        <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          País
                        </p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {userPreferences?.country || "No especificado"}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 text-right">
                      Personaliza tus recetas según tu contexto, alergias y gustos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ACCIONES PRINCIPALES COMO CARDS (glass + glow) */}
            <section className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <button
                onClick={() => handleNavigation("/ingredients")}
                className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 text-left shadow-md shadow-amber-300/20 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/95"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/40 via-yellow-300/30 to-transparent blur-3xl opacity-80" />
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-amber-200 shadow-lg shadow-amber-500/40 dark:bg-gray-900">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ingredientes → Recetas
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Dime qué tienes y Chefcito arma el menú.
                    </p>
                  </div>
                </div>
                <p className="relative text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Escribe o dicta los ingredientes de tu nevera y obtén ideas de
                  platos que realmente puedes preparar ahora mismo.
                </p>
                <div className="relative flex items-center text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Empezar ahora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleNavigation("/recipe-analysis")}
                className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 text-left shadow-md hover:shadow-xl shadow-green-300/20 hover:-translate-y-1 transition-all cursor-pointer backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/95"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-tr from-green-900/70 via-green-700/50 to-transparent blur-3xl opacity-70 dark:from-green-700/70" />
                <div className="relative flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-green-200 shadow-lg shadow-green-500/40 dark:bg-gray-900">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Receta → Análisis
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Desarma cualquier receta paso a paso.
                    </p>
                  </div>
                </div>
                <p className="relative text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Comparte el nombre de una receta y obtén la lista completa de
                  ingredientes para verificar qué te falta y qué puedes sustituir.
                </p>
                <div className="relative flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Analizar una receta
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </section>

            {/* PREFERENCIAS & FAVORITOS */}
            <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-md backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tu mundo en Chefcito
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Preferencias, alergias y recetas favoritas, todo alineado a tu
                    forma de comer.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Preferencias */}
                <div className="md:border-r md:border-b-0 border-b border-gray-200/70 md:pr-6 pb-6 md:pb-0 dark:border-gray-800 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50/90 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        Tus preferencias
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {userPreferences?.preferredCuisines?.length || 0} cocinas ·{" "}
                        {userPreferences?.allergies?.length || 0} alergias
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Cocinas favoritas
                      </p>
                      {userPreferences?.preferredCuisines?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {userPreferences.preferredCuisines.slice(0, 4).map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-[11px]"
                            >
                              {item}
                            </span>
                          ))}
                          {userPreferences.preferredCuisines.length > 4 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-[11px]">
                              +{userPreferences.preferredCuisines.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                          Aún no has definido cocinas favoritas.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Alergias
                      </p>
                      {userPreferences?.allergies?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {userPreferences.allergies.slice(0, 4).map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200 px-2 py-1 rounded-full text-[11px]"
                            >
                              {item}
                            </span>
                          ))}
                          {userPreferences.allergies.length > 4 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-[11px]">
                              +{userPreferences.allergies.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                          Sin alergias registradas.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        País
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full text-[11px]">
                          {userPreferences?.country || "No especificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/onboarding")}
                    className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-amber-700 hover:text-amber-900 transition-colors dark:text-amber-300 dark:hover:text-amber-100"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Ajustar preferencias y restricciones
                  </button>
                </div>

                {/* Favoritos */}
                <div className="md:pl-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-50/90 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600 dark:text-pink-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        Recetas favoritas
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {favoritesCount} recetas guardadas
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 text-xs">
                    {isLoadingFavorites ? (
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                        Cargando favoritos...
                      </p>
                    ) : favoritesCount > 0 ? (
                      <div className="space-y-1.5">
                        {Array.from(favorites.values())
                          .slice(0, 4)
                          .map((fav) => (
                            <div
                              key={fav.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/90 hover:bg-amber-50/80 transition-colors dark:bg-gray-800/80 dark:hover:bg-gray-800"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-pink-500 flex-shrink-0" />
                              <span className="text-gray-800 dark:text-gray-200 text-[11px] truncate flex-1">
                                {fav.nombre}
                              </span>
                            </div>
                          ))}
                        {favoritesCount > 4 && (
                          <p className="text-gray-500 dark:text-gray-400 text-[11px] text-center mt-2">
                            +{favoritesCount - 4} recetas más en tu lista.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                        Aún no tienes recetas favoritas. Guarda tus preferidas para
                        encontrarlas en segundos.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => router.push("/favorites")}
                    className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-pink-600 hover:text-pink-700 transition-colors dark:text-pink-300 dark:hover:text-pink-200"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Ver todas tus recetas favoritas
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}



/** Pill reutilizable para los stats rápidos */
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-amber-50/80 px-2.5 py-2 dark:bg-amber-500/10">
      <p className="text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}
