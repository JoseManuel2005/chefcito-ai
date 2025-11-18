// src/components/recipe-analysis/RecipeAnalysisForm.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, Camera, X } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder/VoiceRecorder";
import { itemVariants } from "@/utils/animations";

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
  onConfirmDishImage: () => void;
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
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para cuando se selecciona un archivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 4MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPendingDishImage(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Limpiar preview
  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingDishImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handler para cerrar modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    clearPreview();
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
          >
            <Camera className="w-6 h-6 animate-bounce-slow group-hover:scale-110 transition-transform" />
            <span>¿Tienes una foto del plato preparado?</span>
          </motion.button>
        </div>

        {/* Modal de subida de imagen */}
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
                    onClick={handleCloseImageModal}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Input de archivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Área de preview o botón de subida */}
                {preview ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearPreview}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowImageModal(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        Confirmar imagen
                      </button>
                      <button
                        type="button"
                        onClick={clearPreview}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-20 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
                    >
                      <Camera className="w-12 h-12 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Seleccionar imagen
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Máximo 4MB
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmación antes de analizar */}
        {pendingDishImage && !showDishEdit && (
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ¿Estás seguro de usar esta foto para identificar el plato?
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={onConfirmDishImage}
                disabled={isIdentifying}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isIdentifying ? "Analizando..." : "Sí, usar esta foto"}
              </button>
              <button
                type="button"
                onClick={() => setPendingDishImage(null)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Bloque de edición tras identificación */}
        {showDishEdit && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ¿Es este el plato correcto? Puedes corregir el nombre antes de analizar.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={dishNameFromImage}
                onChange={(e) => setDishNameFromImage(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Nombre del plato"
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
                Analizar esta receta
              </button>
              <button
                type="button"
                onClick={onCancelDishEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
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
