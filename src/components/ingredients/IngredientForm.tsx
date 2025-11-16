"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Clock, Search } from "lucide-react";
import VoiceRecorder from '@/components/VoiceRecorder/VoiceRecorder';
import ImageUploadInput from '@/components/ImageUploadInput';
import EditableChips from '@/components/EditableChips';
import { itemVariants } from "@/utils/animations";
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
  showImageChips: boolean;
  ingredientsFromImage: string[];
  setIngredientsFromImage: (items: string[]) => void;
  onSaveImageIngredients: () => void;
  onCancelImageIngredients: () => void;
  onImageProcessed: (rawText: string) => void;
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
  showImageChips,
  ingredientsFromImage,
  setIngredientsFromImage,
  onSaveImageIngredients,
  onCancelImageIngredients,
  onImageProcessed,
}: IngredientFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Sección de subida de imagen */}
      <div>
        <ImageUploadInput onImageProcessed={onImageProcessed} />
      </div>

      {/* Chips editables post-OCR */}
      {showImageChips && (
        <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/50">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
            Ingredientes detectados:
          </h4>
          <EditableChips
            items={ingredientsFromImage}
            onChange={setIngredientsFromImage}
          />
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onSaveImageIngredients}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Usar ingredientes
            </button>
            <button
              type="button"
              onClick={onCancelImageIngredients}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            isExpired
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
        <div>
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
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Cerrar campo de voz"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Este campo solo aparece tras usar el micrófono. Edita si la transcripción no es precisa.
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
              if (cleanText !== "") setIsVoiceFieldActive(true);
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
              Buscar recetas
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
