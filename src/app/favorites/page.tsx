"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUserData } from "@/hooks/useUserData";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { Heart, ChefHat, Clock, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { userPhoto } = useUserData();
  const { favorites, isLoadingFavorites, toggleFavorite } = useFavoriteRecipes();

  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [tempMessageType, setTempMessageType] = useState<"error" | "success">("success");

  const favoritesList = useMemo(() => Array.from(favorites.values()), [favorites]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar userPhoto={userPhoto} />

      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto pt-0 md:pt-2">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Recetas Favoritas
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Tu colección personal de recetas
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoadingFavorites ? (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <ChefHat className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando tus favoritos...</p>
                </div>
              </motion.div>
            ) : favoritesList.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Aún no tienes favoritos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Marca recetas con el corazón para guardarlas aquí y poder consultarlas cuando quieras.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="space-y-4 md:space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favoritesList.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
                    variants={itemVariants}
                  >
                    <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                            {recipe.nombre || `Receta ${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-1">
                            {/* Botón quitar de favoritos */}
                            <motion.button
                              type="button"
                              onClick={async () => {
                                const ok = await toggleFavorite({
                                  nombre: recipe.nombre,
                                  ingredientes: recipe.ingredientes,
                                  pasos: recipe.pasos,
                                  tiempo: recipe.tiempo,
                                });
                                if (ok) {
                                  setTempMessage("Eliminado de favoritos");
                                  setTempMessageType("success");
                                } else {
                                  setTempMessage("No se pudo actualizar el favorito");
                                  setTempMessageType("error");
                                }
                                setTimeout(() => setTempMessage(null), 2500);
                              }}
                              className="p-1.5 rounded-full transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Quitar de favoritos"
                            >
                              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            {recipe.tiempo || "Tiempo no estimado"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 md:gap-0 mr-20">
                      <div className="col-span-1">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                          Ingredientes:
                        </h5>
                        <ul className="space-y-1 md:space-y-2">
                          {(recipe.ingredientes || []).map((ing, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                              <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-span-2 md:ml-5">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                          Preparación:
                        </h5>
                        <ol className="space-y-1 md:space-y-2">
                          {(recipe.pasos || []).map((paso, i) => (
                            <li key={i} className="flex gap-2 md:gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                              <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{paso}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tempMessage && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
            tempMessageType === "error"
              ? "bg-red-500 text-white dark:bg-red-600"
              : "bg-green-500 text-white dark:bg-green-600"
          }`}
        >
          {tempMessage}
        </div>
      )}

      <Footer />
    </main>
  );
}
