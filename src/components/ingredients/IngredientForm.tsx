"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Clock, Search, Camera, CheckCircle2, Eye, Sparkles } from "lucide-react";
import VoiceRecorder from '@/components/VoiceRecorder/VoiceRecorder';
import ImageUploadInputWithTypeSelector from '@/components/ImageUploadInputWithTypeSelector';
import EditableChips from '@/components/EditableChips';
import { itemVariants } from "@/utils/animations";
import { useState } from "react";
import type { Ingredient } from "@/hooks/useIngredients";

/**
 * Props del componente IngredientForm
 */
interface IngredientFormProps {
  ingredients: Ingredient[];
  onAddIngredient: () => void;
  onChangeIngredientName: (value: string, index: number) => void;
  onChangeIngredientExpiry: (value: string, index: number) => void;
  onRemoveIngredient: (index: number) => void;
  getDaysUntilExpiry: (expiryDate: string | null) => number | null;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  loading: boolean;
  isLoading: boolean;
  voiceTranscription: string;
  setVoiceTranscription: (value: string) => void;
  isVoiceFieldActive: boolean;
  setIsVoiceFieldActive: (value: boolean) => void;
  useOnlyVoiceIngredients: boolean;
  setUseOnlyVoiceIngredients: (value: boolean) => void;
  hasManualIngredients: boolean;
  hasImageIngredients: boolean;
  showImageChips: boolean;
  ingredientsFromImage: string[];
  setIngredientsFromImage: (items: string[]) => void;
  detectionConfidence?: number | null;
  detectionType?: 'ocr' | 'visual' | null;
  onSaveImageIngredients: () => void;
  onCancelImageIngredients: () => void;
  onImageProcessed: (rawText: string) => void;
  onRawIngredientsDetected: (ingredients: string[], confidence: number) => void;
  userPreferences?: any;
}

/**
 * Componente de formulario para gestión de ingredientes
 * 
 * Características:
 * - Entrada manual de ingredientes con fechas de vencimiento
 * - Detección de ingredientes por voz (usando VoiceRecorder)
 * - Detección de ingredientes por imagen/OCR (usando ImageUploadInput)
 * - Validación visual de ingredientes próximos a vencer
 * - Chips editables para revisar ingredientes detectados
 * 
 * @component
 * @example
 * ```tsx
 * <IngredientForm
 *   ingredients={ingredients.ingredients}
 *   onAddIngredient={ingredients.addIngredient}
 *   onSubmit={handleSearch}
 *   loading={false}
 * />
 * ```
 */
export default function IngredientForm({
  ingredients,
  onAddIngredient,
  onChangeIngredientName,
  onChangeIngredientExpiry,
  onRemoveIngredient,
  getDaysUntilExpiry,
  onSubmit,
  onReset,
  loading,
  isLoading,
  voiceTranscription,
  setVoiceTranscription,
  isVoiceFieldActive,
  setIsVoiceFieldActive,
  useOnlyVoiceIngredients,
  setUseOnlyVoiceIngredients,
  hasManualIngredients,
  hasImageIngredients,
  showImageChips,
  ingredientsFromImage,
  setIngredientsFromImage,
  detectionConfidence,
  detectionType,
  onSaveImageIngredients,
  onCancelImageIngredients,
  onImageProcessed,
  onRawIngredientsDetected,
  userPreferences,
}: IngredientFormProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Handler para cuando se procesa la imagen: cierra modal y propaga resultado
  const handleImageProcessed = async (rawText: string) => {
    setIsProcessingImage(true);
    setShowImageModal(false);
    await onImageProcessed(rawText);
    setIsProcessingImage(false);
  };

  // Handler para cuando se detectan ingredientes crudos
  const handleRawIngredientsDetected = (ingredients: string[], confidence: number) => {
    setShowImageModal(false);
    onRawIngredientsDetected(ingredients, confidence);
  };

  // Handler para cerrar modal (cancelar)
  const handleCloseImageModal = () => setShowImageModal(false);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Botón de foto principal */}
      <div className="flex justify-center mb-2">
        <motion.button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="flex items-center gap-3 mb-5 px-5 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/40 text-amber-700 dark:text-amber-300 font-bold rounded-2xl shadow-md border-2 border-dashed border-amber-300 dark:border-amber-700 transition-all duration-200 text-base group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Camera className="w-6 h-6 animate-bounce-slow group-hover:scale-110 transition-transform" />
          <span>Agregar ingredientes por foto</span>
        </motion.button>
      </div>

      {/* Modal de subida de imagen con selector de tipo */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-4xl mx-auto max-h-[80vh] overflow-y-auto -mt-40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 border border-amber-200 dark:border-amber-300">
              <ImageUploadInputWithTypeSelector
                onImageProcessed={handleImageProcessed}
                onRawIngredientsDetected={handleRawIngredientsDetected}
                onError={() => { }}
                disabled={false}
                userPreferences={userPreferences}
              />
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={handleCloseImageModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de procesamiento de imagen */}
      <AnimatePresence>
        {isProcessingImage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Procesando imagen y detectando ingredientes...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips editables post-OCR */}
      <AnimatePresence>
        {showImageChips && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {ingredientsFromImage.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                  No se detectaron ingredientes en la imagen
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Intenta con una imagen más clara o con mejor iluminación
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onCancelImageIngredients();
                    setShowImageModal(true);
                  }}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <div className={`p-5 rounded-2xl border-2 shadow-lg ${
                detectionType === 'visual' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300/50 dark:border-green-700/50'
                  : 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300/50 dark:border-yellow-700/50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {detectionType === 'visual' ? (
                    <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <h4 className={`text-base font-bold ${
                    detectionType === 'visual' 
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {detectionType === 'visual' ? 'Ingredientes identificados visualmente' : 'Ingredientes detectados'}
                  </h4>
                  <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${
                    detectionType === 'visual'
                      ? 'bg-green-200 dark:bg-green-800/50 text-green-700 dark:text-green-300'
                      : 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {ingredientsFromImage.length} {ingredientsFromImage.length === 1 ? 'ingrediente' : 'ingredientes'}
                  </span>
                </div>

                {/* Mostrar confianza para detección visual */}
                {detectionType === 'visual' && detectionConfidence != null && (
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-700 dark:text-green-400">
                      <strong>Confianza de detección:</strong> {Math.round(detectionConfidence * 100)}%
                      {detectionConfidence < 0.7 && ' (revisa cuidadosamente)'}
                    </span>
                  </div>
                )}

                <p className={`text-sm mb-3 ${
                  detectionType === 'visual' 
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-yellow-700 dark:text-yellow-400'
                }`}>
                  {detectionType === 'visual' 
                    ? 'Ingredientes identificados usando inteligencia artificial. Revisa y confirma antes de agregar.'
                    : 'Revisa y edita los ingredientes antes de agregarlos a tu lista'
                  }
                </p>

                <div className="bg-white/50 dark:bg-gray-900/30 p-3 rounded-xl">
                  <EditableChips
                    items={ingredientsFromImage}
                    onChange={setIngredientsFromImage}
                  />
                </div>

                <div className={`flex gap-2 mt-4 pt-4 ${
                  detectionType === 'visual' 
                    ? 'border-t border-green-200 dark:border-green-800'
                    : 'border-t border-yellow-200 dark:border-yellow-800'
                }`}>
                  <motion.button
                    type="button"
                    onClick={onSaveImageIngredients}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer ${
                      detectionType === 'visual'
                        ? 'bg-green-400 hover:bg-green-500 text-gray-800'
                        : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.007 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar {ingredientsFromImage.length} {ingredientsFromImage.length === 1 ? 'ingrediente' : 'ingredientes'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={onCancelImageIngredients}
                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de ingredientes */}
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => {
          const daysUntil = getDaysUntilExpiry(ingredient.expiry ?? null);
          const isExpiringSoon = daysUntil !== null && daysUntil <= 2;
          const isExpired = daysUntil !== null && daysUntil < 0;

          return (
            <motion.div key={index} className="flex flex-col gap-2" variants={itemVariants} layout>
              <div className="flex flex-col sm:flex-row gap-2 items-start">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => onChangeIngredientName(e.target.value, index)}
                  className="flex-1 w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white dark:bg-gray-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ej: tomate, cebolla, pollo..."
                />

                <div className="flex flex-col sm:flex-row items-start gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto min-w-[170px]">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={ingredient.expiry || ""}
                      onChange={(e) => onChangeIngredientExpiry(e.target.value, index)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white dark:bg-gray-800 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm cursor-pointer"
                      aria-label="Fecha de vencimiento (opcional)"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-center sm:self-start">
                    <AnimatePresence>
                      {isExpiringSoon && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${isExpired
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            }`}
                        >
                          {isExpired ? "Vencido" : `Vence en ${daysUntil} días`}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {ingredients.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => onRemoveIngredient(index)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.button
          type="button"
          onClick={onAddIngredient}
          className="w-full py-2.5 border-2 cursor-pointer border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-xl hover:border-yellow-300 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          Agregar ingrediente
        </motion.button>
      </div>

      {/* Campo de voz */}
      {isVoiceFieldActive ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={voiceTranscription}
              onChange={(e) => setVoiceTranscription(e.target.value)}
              placeholder="Edita la transcripción si es necesario..."
              className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm placeholder-gray-500 dark:placeholder-gray-400"
              aria-label="Transcripción de voz (editable)"
            />
            <button
              type="button"
              onClick={() => {
                setVoiceTranscription("");
                setIsVoiceFieldActive(false);
                setUseOnlyVoiceIngredients(false);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Cerrar campo de voz"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Selector de fuente cuando hay múltiples ingredientes */}
          {(hasManualIngredients || hasImageIngredients) && voiceTranscription.trim() !== "" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                  Tienes múltiples fuentes de ingredientes
                </h4>
              </div>
              
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                Elige qué ingredientes quieres usar para buscar recetas:
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="ingredientSource"
                    checked={!useOnlyVoiceIngredients}
                    onChange={() => setUseOnlyVoiceIngredients(false)}
                    className="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                    <strong>Combinar todos:</strong> Ingredientes manuales{hasImageIngredients ? ", por foto" : ""} y por voz
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="ingredientSource"
                    checked={useOnlyVoiceIngredients}
                    onChange={() => setUseOnlyVoiceIngredients(true)}
                    className="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                    <strong>Solo por voz:</strong> Usar únicamente los ingredientes que dijiste
                  </span>
                </label>
              </div>
              
              <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Ingredientes por voz:</strong> {voiceTranscription || "(ninguno)"}
                </p>
              </div>
            </motion.div>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Este campo aparece tras usar el micrófono. Edita si la transcripción no es precisa.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 rounded-xl text-sm cursor-not-allowed">
            Habla tus ingredientes usando el micrófono
          </div>
          <VoiceRecorder
            onTranscriptionReady={(text) => {
              const cleanText = text.trim();
              setVoiceTranscription(cleanText);
              if (cleanText !== "") {
                setIsVoiceFieldActive(true);
                // Si hay otros ingredientes y se usa voz, preseleccionar "solo voz"
                if ((hasManualIngredients || hasImageIngredients) && cleanText !== "") {
                  setUseOnlyVoiceIngredients(true);
                }
              }
            }}
          />
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <motion.button
          type="submit"
          disabled={
            loading ||
            (ingredients.every((ing) => ing.name.trim() === "") && voiceTranscription.trim() === "") ||
            isLoading
          }
          className="flex-1 dark:text-gray-800 cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          whileHover={{
            scale:
              loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                ? 1
                : 1.02,
            boxShadow:
              loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                ? "none"
                : "0 4px 12px rgba(251, 191, 36, 0.3)",
          }}
          whileTap={{
            scale:
              loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                ? 1
                : 0.98,
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Generando recetas...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              {useOnlyVoiceIngredients && voiceTranscription.trim() !== "" 
                ? "Buscar con ingredientes por voz" 
                : "Buscar recetas"
              }
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 border cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Limpiar
        </motion.button>
      </div>
    </form>
  );
}