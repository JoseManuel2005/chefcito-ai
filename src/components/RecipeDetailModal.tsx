"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, X, Volume2, Pause } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { useEffect } from "react";
import ChiefLogo from "@/components/ChiefLogo";

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

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/60 dark:border-gray-800/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-amber-300 shadow-lg dark:bg-gray-800">
                  <ChiefLogo className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recipe.nombre || `Receta ${(index ?? 0) + 1}`}
                  </h2>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{(recipe.tiempo || "No estimado").replace(/minutos?/gi, 'min')}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{recipe.ingredientes?.length || 0} ing</span>
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
                  className="p-2.5 text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tts.status === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
                  title={tts.status === "playing" ? "Pausar" : "Escuchar receta"}
                >
                  {tts.status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  ) : tts.status === "playing" ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Botón de Cerrar */}
                <motion.button
                  onClick={handleClose}
                  className="p-2.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Ingredientes */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/60">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Ingredientes
                  </h3>
                  <ul className="space-y-2.5">
                    {(recipe.ingredientes || []).map((ing: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0 mt-2" />
                        <span className="text-sm leading-relaxed">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pasos de Preparación */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/60">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Preparación
                  </h3>
                  <ol className="space-y-4">
                    {(recipe.pasos || []).map((paso: string, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 text-pink-700 dark:text-pink-300 text-xs font-bold rounded-full shrink-0 shadow-sm">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
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