// src/components/recipe-analysis/RecipeAnalysisForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Camera } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder/VoiceRecorder";
import { itemVariants } from "@/utils/animations";
import RecipeImageUploadInput from "./RecipeImageUploadInput";

interface RecipeAnalysisFormProps {
  recipe: string;
  setRecipe: (value: string) => void;
  voiceTranscription: string;
  setVoiceTranscription: (value: string) => void;
  pendingDishImage: File | null;
  setPendingDishImage: (file: File | null) => void;
  isIdentifying: boolean;
  showDishEdit: boolean;
  dishNameFromImage: string;
  setDishNameFromImage: (value: string) => void;
  confidence: number | null;
  onConfirmDishImage: (file: File) => void;
  onCancelDishEdit: () => void;
  onAnalyzeFromImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  loading: boolean;
  extractRecipeName: (text: string) => string;
}

export default function RecipeAnalysisForm({
  recipe,
  setRecipe,
  voiceTranscription,
  setVoiceTranscription,
  pendingDishImage,
  setPendingDishImage,
  isIdentifying,
  showDishEdit,
  dishNameFromImage,
  setDishNameFromImage,
  confidence,
  onConfirmDishImage,
  onCancelDishEdit,
  onAnalyzeFromImage,
  onSubmit,
  onReset,
  loading,
  extractRecipeName,
}: RecipeAnalysisFormProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  // Función simplificada que procesa la imagen directamente
  const handleImageProcessed = (file: File) => {
    setPendingDishImage(file);
    setShowImageModal(false);
    // ✅ Pasar el archivo directamente, no depender del estado
    onConfirmDishImage(file);
  };

  return (
    <div className="relative">
      {/* Glow detrás */}
      <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-green-400/25 via-emerald-200/10 to-transparent blur-3xl opacity-80 dark:from-green-500/25 dark:via-emerald-300/10 dark:to-transparent" />

      <motion.div
        layout
        className="relative rounded-[2.5rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 transition-all duration-300"
        initial="hidden"
        animate="visible"
      >
        {/* Botón principal de subir foto */}
        <div className="flex justify-center mb-6">
          <motion.button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="flex items-center gap-3 px-5 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 font-bold rounded-2xl shadow-md border-2 border-dashed border-green-300 dark:border-green-700 transition-all duration-200 text-base group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || isIdentifying}
          >
            <span className="w-6 h-6 animate-bounce-slow group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </span>
            <span>¿Tienes una foto del plato preparado?</span>
          </motion.button>
        </div>

        {/* Modal de subida de imagen - procesamiento automático */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md mx-auto p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Subir foto del plato
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <RecipeImageUploadInput
                  onImageProcessed={handleImageProcessed}
                  disabled={loading || isIdentifying}
                />
              </div>
            </div>
          </div>
        )}

        {/* Solo mostrar edición si la confianza es baja o el usuario quiere corregir */}
        {showDishEdit && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Identificamos "{dishNameFromImage}". ¿Es correcto?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={dishNameFromImage}
                onChange={(e) => setDishNameFromImage(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Corrige el nombre si es necesario"
              />
              {confidence !== null && (
                <span className="px-3 py-2 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg whitespace-nowrap">
                  {Math.round(confidence * 100)}% seguro
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAnalyzeFromImage}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded font-medium cursor-pointer"
              >
                Analizar receta
              </button>
              <button
                type="button"
                onClick={onCancelDishEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* Indicador cuando está identificando */}
        {isIdentifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"
            />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Identificando plato en la foto...
            </span>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
          <motion.div variants={itemVariants}>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={recipe}
                  onChange={(e) => setRecipe(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-800 focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-colors text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ej: Paella valenciana, Tacos al pastor..."
                />
                <VoiceRecorder
                  onTranscriptionReady={(text) => {
                    const extractedRecipe = extractRecipeName(text);
                    if (extractedRecipe.trim() !== "") setRecipe(extractedRecipe);
                    setVoiceTranscription(text);
                  }}
                />
              </div>
              {voiceTranscription && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Transcripción: <span className="font-medium">{voiceTranscription}</span>
                </p>
              )}
            </div>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-3" variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={loading || recipe.trim().length < 3}
              className="flex-1 dark:text-gray-800 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
              whileHover={{
                scale: loading || !recipe.trim() ? 1 : 1.02,
                boxShadow:
                  loading || !recipe.trim() ? "none" : "0 4px 12px rgba(34, 197, 94, 0.3)",
              }}
              whileTap={{ scale: loading || !recipe.trim() ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Analizando receta...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 dark:text-gray-800" />
                  Analizar ingredientes
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={onReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 cursor-pointer dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Limpiar
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}