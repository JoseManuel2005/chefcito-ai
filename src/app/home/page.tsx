"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  BookOpen,
  ChefHat,
  ArrowRight,
  Heart,
  Settings,
  MapPin,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";

export default function HomePage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const { favorites, isLoadingFavorites } = useFavoriteRecipes();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 background-grid">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5 animate-pulse">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 background-grid">
      <Navbar userPhoto={userPhoto} />
      <div className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ¡Bienvenido a Chefcito AI!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Tu asistente culinario inteligente</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => handleNavigation("/ingredients")}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-left hover:border-yellow-200 dark:hover:border-yellow-600 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                  <Utensils className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Ingredientes → Recetas
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Genera recetas con tus ingredientes
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Dime qué ingredientes tienes y te sugeriré deliciosas recetas
                que puedes preparar.
              </p>
              <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => handleNavigation("/recipe-analysis")}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-left hover:border-green-200 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Receta → Análisis
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Analiza ingredientes de una receta
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Dime el nombre de una receta y te mostraré todos los
                ingredientes necesarios.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Card combinada */}
          {(userPreferences || true) && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sección de Preferencias */}
                <div className="md:border-r border-gray-200 dark:border-gray-700 md:pr-6 pb-6 md:pb-0 border-b md:border-b-0 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Tus preferencias
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {userPreferences?.preferredCuisines?.length || 0} cocinas · {userPreferences?.allergies?.length || 0} alergias
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Cocinas favoritas</p>
                      {userPreferences?.preferredCuisines?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {userPreferences.preferredCuisines.slice(0, 3).map((item, idx) => (
                            <span 
                              key={idx} 
                              className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs"
                            >
                              {item}
                            </span>
                          ))}
                          {userPreferences.preferredCuisines.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                              +{userPreferences.preferredCuisines.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Sin preferencias</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Alergias</p>
                      {userPreferences?.allergies?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {userPreferences.allergies.slice(0, 3).map((item, idx) => (
                            <span 
                              key={idx} 
                              className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs"
                            >
                              {item}
                            </span>
                          ))}
                          {userPreferences.allergies.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                              +{userPreferences.allergies.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Sin alergias</p>
                      )}
                    </div>

                    {/* País agregado */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">País</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                          {userPreferences?.country || "No especificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón al fondo */}
                  <button
                    onClick={() => router.push("/onboarding")}
                    className="mt-auto pt-4 text-yellow-600 dark:text-yellow-400 font-medium text-xs hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <Settings className="w-3 h-3" />
                    Editar preferencias
                  </button>
                </div>

                {/* Sección de Favoritos */}
                <div className="md:pl-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Recetas favoritas
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Array.from(favorites.values()).length} recetas guardadas
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {isLoadingFavorites ? (
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Cargando favoritos...</p>
                    ) : Array.from(favorites.values()).length > 0 ? (
                      <div>
                        {Array.from(favorites.values()).slice(0, 3).map((fav) => (
                          <div 
                            key={fav.id} 
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-800 dark:text-gray-200 text-sm truncate flex-1">
                              {fav.nombre}
                            </span>
                          </div>
                        ))}
                        {Array.from(favorites.values()).length > 3 && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-2">
                            +{Array.from(favorites.values()).length - 3} más...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Aún no tienes recetas favoritas.</p>
                    )}
                  </div>

                  {/* Botón al fondo */}
                  <button
                    onClick={() => router.push("/favorites")}
                    className="mt-auto pt-4 text-pink-600 dark:text-pink-400 font-medium text-xs hover:text-pink-700 dark:hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <Heart className="w-3 h-3" />
                    Ver todas las favoritas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}