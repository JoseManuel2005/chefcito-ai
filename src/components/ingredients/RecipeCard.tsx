"use client";

import { motion } from "framer-motion";
import { ChefHat, Clock, Volume2, Pause, Heart, Share2, ImageIcon, Eye } from "lucide-react";
import ShareMenu from "@/components/ShareMenu";
import type { Recipe } from "@/hooks/useRecipeSearch";

/**
 * Props del componente RecipeCard
 */
interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  isMobile: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  currentTTSIndex: number | null;
  ttsStatus: string;
  onTTSClick: () => void;
  openMenuIndex: number | null;
  setOpenMenuIndex: (index: number | null) => void;
  onShareText: () => void;
  onCopyText: () => void;
  onShareImage: () => void;
  dishImage: string | undefined;
  showDishImage: boolean;
  loadingDishImage: boolean;
  onGenerateImage: () => void;
}

/**
 * Tarjeta de receta individual con todas sus funcionalidades
 * 
 * Características:
 * - Visualización de nombre, tiempo, ingredientes y pasos
 * - Audio TTS para leer la receta en voz alta
 * - Menú de compartir (texto, copiar, imagen)
 * - Botón de favoritos con persistencia
 * - Generación de imagen del plato con IA
 * - Animaciones suaves y responsive
 * 
 * @component
 * @example
 * ```tsx
 * <RecipeCard
 *   recipe={recipe}
 *   index={0}
 *   isFavorite={true}
 *   onToggleFavorite={() => {}}
 *   onTTSClick={() => {}}
 * />
 * ```
 */
export default function RecipeCard({
  recipe,
  index,
  isMobile,
  isFavorite,
  onToggleFavorite,
  currentTTSIndex,
  ttsStatus,
  onTTSClick,
  openMenuIndex,
  setOpenMenuIndex,
  onShareText,
  onCopyText,
  onShareImage,
  dishImage,
  showDishImage,
  loadingDishImage,
  onGenerateImage,
}: RecipeCardProps) {
  const nombreReceta = recipe.nombre || `Receta ${index + 1}`;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      whileHover={{ y: isMobile ? 0 : -4 }}
    >
      {/* Glow detrás de la card */}
      <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-amber-400/20 via-amber-200/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_12px_50px_rgba(0,0,0,0.4)] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
        <motion.div
          className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0"
          whileHover={{ rotate: 5 }}
        >
          <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
              {nombreReceta}
            </h4>

            {/* Botonera: Audio / Menú / Favorito / Imagen */}
            <div className="flex items-center gap-1">
              {/* Menú compartir */}
              <div className="relative" id={`menu-${index}`}>
                <motion.button
                  type="button"
                  onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Más opciones"
                  title="Compartir / Copiar"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>

                {openMenuIndex === index && (
                  <ShareMenu
                    onShareText={onShareText}
                    onCopyText={onCopyText}
                    onShareImage={onShareImage}
                  />
                )}
              </div>

              {/* Audio TTS */}
              <motion.button
                type="button"
                onClick={onTTSClick}
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={currentTTSIndex === index && ttsStatus === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
              >
                {currentTTSIndex === index && ttsStatus === "loading" ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : currentTTSIndex === index && ttsStatus === "playing" ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </motion.button>
              
              {/* Imagen del plato */}
              <motion.button
                type="button"
                onClick={onGenerateImage}
                className="p-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={dishImage ? "Ver/Ocultar imagen" : "Generar imagen del plato"}
              >
                {loadingDishImage ? (
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                ) : dishImage ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Favorito */}
              <motion.button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-full transition-colors cursor-pointer group ${
                  isFavorite ? "hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? "text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                  }`}
                />
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          className="col-span-1"
        >
          <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
            Ingredientes:
          </h5>
          <ul className="space-y-1 md:space-y-2">
            {(recipe.ingredientes || []).map((ing: string, i: number) => (
              <motion.li
                key={i}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
              >
                <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                {ing}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="col-span-2 md:ml-5"
        >
          <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
            Preparación:
          </h5>
          <ol className="space-y-1 md:space-y-2">
            {(recipe.pasos || []).map((paso: string, i: number) => (
              <motion.li
                key={i}
                className="flex gap-2 md:gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 + i * 0.05 }}
              >
                <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{paso}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>

      {showDishImage && dishImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <img
            src={`data:image/png;base64,${dishImage}`}
            alt={`Imagen de ${recipe.nombre}`}
            className="w-full max-h-64 object-cover"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center">
            Imagen generada con IA • SynthID
          </p>
        </motion.div>
      )}
      </div>
    </motion.div>
  );
}
