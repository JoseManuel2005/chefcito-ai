// app/home/page.tsx
"use client"; // Indica que este componente es un Client Component en Next.js 13+.

import { useState } from "react";
import { useRouter } from "next/navigation"; // Hook para navegación en App Router de Next.js.
import {
  Utensils,
  BookOpen,
  ChefHat,
  ArrowRight,
} from "lucide-react"; // Íconos vectoriales desde Lucide React.
import { useUserData } from "@/hooks/useUserData"; // Hook personalizado para obtener datos del usuario desde Firebase.
import Footer from "@/components/Footer"; // Componente de pie de página reutilizable.
import Navbar from "@/components/Navbar"; // Componente de barra de navegación reutilizable.

/**
 * Página principal de la aplicación (Home).
 * Muestra opciones de funcionalidad y un resumen de las preferencias del usuario.
 */
export default function HomePage() {
  const router = useRouter(); // Instancia del enrutador para navegar programáticamente.
  const { userPhoto, userPreferences, isLoading } = useUserData(); // Extrae datos del usuario y estado de carga.

  /**
   * Maneja la navegación a otras rutas de la aplicación.
   * @param path - Ruta destino (ej. "/ingredients").
   */
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Muestra un estado de carga mientras se obtienen los datos del usuario.
  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            {/* Ícono animado de carga */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5 animate-pulse">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* Barra de navegación con foto del usuario (puede ser null si no está autenticado) */}
      <Navbar userPhoto={userPhoto}/>
      <div className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado visual con ícono y título */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              ¡Bienvenido a Chefscito AI!
            </h1>
            <p className="text-gray-600">Tu asistente culinario inteligente</p>
          </div>

          {/* Sección de selección de modos de uso */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Botón: Modo "Ingredientes → Recetas" */}
            <button
              onClick={() => handleNavigation("/ingredients")}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:border-yellow-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                  <Utensils className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Ingredientes → Recetas
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Genera recetas con tus ingredientes
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Dime qué ingredientes tienes y te sugeriré deliciosas recetas
                que puedes preparar.
              </p>
              <div className="flex items-center text-yellow-600 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Botón: Modo "Receta → Análisis" */}
            <button
              onClick={() => handleNavigation("/recipe-analysis")}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:border-yellow-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Receta → Análisis
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Analiza ingredientes de una receta
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Dime el nombre de una receta y te mostraré todos los
                ingredientes necesarios.
              </p>
              <div className="flex items-center text-green-600 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Resumen de preferencias del usuario (solo si existen) */}
          {userPreferences && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tus preferencias
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium mb-1">Alergias</p>
                  <p className="text-gray-800">
                    {userPreferences.allergies.length
                      ? userPreferences.allergies.join(", ")
                      : "Ninguna"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1">Cocinas favoritas</p>
                  <p className="text-gray-800">
                    {userPreferences.preferredCuisines.length
                      ? userPreferences.preferredCuisines.join(", ")
                      : "Ninguna"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1">País</p>
                  <p className="text-gray-800">
                    {userPreferences.country || "No especificado"}
                  </p>
                </div>
              </div>
              {/* Enlace para editar preferencias */}
              <button
                onClick={() => router.push("/onboarding")}
                className="mt-4 text-yellow-600 font-medium text-sm hover:text-yellow-700 transition-colors cursor-pointer"
              >
                Editar preferencias
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer /> 
    </main>
  );
}