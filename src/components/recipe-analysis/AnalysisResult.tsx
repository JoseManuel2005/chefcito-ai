// src/components/recipe-analysis/AnalysisResult.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Volume2, Pause, Heart, Share2 } from "lucide-react";
import ShareMenu from "@/components/ShareMenu";
import {
  formatRecipeForText,
  copyToClipboard,
  shareSmart,
  shareRecipeAsImage,
} from "@/utils/shareUtils";

interface AnalysisResultProps {
  analysis: any;
  isMobile: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  ttsStatus: "idle" | "loading" | "playing" | "paused" | "error";
  onTTSAction: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
}

export default function AnalysisResult({
  analysis,
  isMobile,
  menuOpen,
  setMenuOpen,
  ttsStatus,
  onTTSAction,
  isFavorite,
  onToggleFavorite,
  showSuccess,
  showError,
}: AnalysisResultProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header con título y acciones */}
      <motion.div
        className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-10 h-10 md:w-12 md:h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0"
          whileHover={{ rotate: 5 }}
        >
          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <motion.h4
              className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {analysis.receta || "Análisis de receta"}
            </motion.h4>

            {/* Botonera: Audio / Menú / Favorito */}
            <div className="flex items-center gap-1">
              <div className="relative" id="analysis-share-menu">
                <motion.button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Más opciones"
                  title="Compartir / Copiar"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>

                {menuOpen && (
                  <ShareMenu
                    onShareText={async () => {
                      setMenuOpen(false);
                      const shareText = formatRecipeForText(analysis);
                      const ok = await shareSmart(
                        shareText,
                        analysis.receta || "Análisis de receta"
                      );
                      if (ok) showSuccess("Hoja de compartir abierta", 1800);
                    }}
                    onCopyText={async () => {
                      setMenuOpen(false);
                      const shareText = formatRecipeForText(analysis);
                      const ok = await copyToClipboard(shareText);
                      ok
                        ? showSuccess("Receta copiada", 1800)
                        : showError("No se pudo copiar", 1800);
                    }}
                    onShareImage={async () => {
                      setMenuOpen(false);
                      await shareRecipeAsImage(analysis, 0, showSuccess, showError);
                    }}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={onTTSAction}
                className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                aria-label={ttsStatus === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
              >
                {ttsStatus === "loading" ? (
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : ttsStatus === "playing" ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <button
                type="button"
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-full transition-colors cursor-pointer group hover:bg-green-50 dark:hover:bg-green-900/20`}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? "text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                  }`}
                />
              </button>
            </div>
          </div>

          <motion.div
            className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            <span>{analysis.tiempo || "Tiempo no estimado"}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenido del análisis */}
      <div className={`${isMobile ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6"}`}>
        <div className={isMobile ? "" : "space-y-6"}>
          {/* Ingredientes */}
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
              Ingredientes:
            </h5>
            <div className="space-y-2">
              {(analysis.ingredientes || []).map((ing: string, i: number) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  initial={{ opacity: 0, x: isMobile ? -10 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  whileHover={{ x: isMobile ? 0 : 5 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"
                    whileHover={{ scale: 1.5 }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                    {ing}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pasos */}
          {analysis.pasos && analysis.pasos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 20 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h5 className="font-semibold text-gray-900 mt-10 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
                Cómo prepararla:
              </h5>
              <ol className="space-y-2">
                {(analysis.pasos || []).map((paso: string, i: number) => (
                  <motion.li
                    key={i}
                    className="flex gap-2 md:gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, y: isMobile ? 10 : 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                  >
                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                      {paso}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </div>

        {/* Comentarios adicionales */}
        {analysis.comentario && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="lg:sticky lg:top-6"
          >
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
              Notas adicionales:
            </h5>
            <motion.div
              className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <p className="text-blue-800 dark:text-blue-300 text-xs md:text-sm leading-relaxed">
                {analysis.comentario}
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
