"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, Users, X, Volume2, Pause } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";

export type Recipe = {
  id: string;
  nombre?: string;
  ingredientes?: string[];
  pasos?: string[];
  tiempo?: string;
};

type RecipeDetailModalProps = {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  index: number | null;
};

export default function RecipeDetailModal({ recipe, isOpen, onClose, index }: RecipeDetailModalProps) {
  const tts = useTTS();

  if (!isOpen || !recipe) return null;

  // Generar el texto para TTS
  const ttsText = `
    Receta: ${recipe.nombre || 'Sin nombre'}.
    Ingredientes: ${recipe.ingredientes?.join(', ') || 'No especificados'}.
    Preparación: ${recipe.pasos?.map((p: string, i: number) => `${i + 1}. ${p}`).join(' ') || 'No especificada'}.
  `.replace(/\s+/g, ' ').trim();

  const handleTTSToggle = () => {
    if (tts.status === "playing") {
      tts.pause();
    } else if (tts.status === "paused") {
      tts.resume();
    } else {
      tts.speak(ttsText);
    }
  };

  const handleClose = () => {
    tts.stop();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recipe.nombre || `Receta ${(index ?? 0) + 1}`}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.tiempo || "Tiempo no estimado"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{recipe.ingredientes?.length || 0} ingredientes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de Acción */}
              <div className="flex items-center gap-2">
                {/* Botón de TTS (Escuchar) */}
                <motion.button
                  type="button"
                  onClick={handleTTSToggle}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tts.status === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
                  title={tts.status === "playing" ? "Pausar" : "Escuchar receta"}
                >
                  {tts.status === "loading" ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : tts.status === "playing" ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </motion.button>

                {/* Botón de Cerrar */}
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Ingredientes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Ingredientes
                  </h3>
                  <ul className="space-y-3">
                    {(recipe.ingredientes || []).map((ing: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                        <span className="text-sm md:text-base">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pasos de Preparación */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Preparación
                  </h3>
                  <ol className="space-y-4">
                    {(recipe.pasos || []).map((paso: string, i: number) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold rounded-full shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base pt-1">
                          {paso}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}