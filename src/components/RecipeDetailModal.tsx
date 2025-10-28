"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, Users, X } from "lucide-react";

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
  if (!isOpen || !recipe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
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
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
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