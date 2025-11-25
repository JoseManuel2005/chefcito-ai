'use client';

import { motion } from "framer-motion";
import { ChefHat, Egg, ArrowLeft } from "lucide-react";

interface ImageTypeSelectorProps {
  onSelectType: (type: 'recipe' | 'ingredients') => void;
  onGoBack: () => void;
}

/**
 * Componente para seleccionar el tipo de imagen subida
 * Permite al usuario elegir si la imagen contiene una receta o ingredientes sin cocinar
 */
export default function ImageTypeSelector({ onSelectType, onGoBack }: ImageTypeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-purple-300/20 to-blue-500/20 rounded-3xl blur-xl" />
      
      <div className="relative bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-xl">
        {/* Header con botón de volver */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={onGoBack}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
            ¿Qué tipo de imagen subiste?
          </h3>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
          Selecciona el tipo de contenido:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opción: Receta */}
          <motion.button
            type="button"
            onClick={() => onSelectType('recipe')}
            className="relative group p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-800/30 dark:hover:to-yellow-800/30 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 cursor-pointer text-left flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-full group-hover:bg-amber-200 dark:group-hover:bg-amber-800/60 transition-colors flex-shrink-0">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">Receta preparada</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Lista escrita</p>
              </div>
            </div>
          </motion.button>
          
          {/* Opción: Ingredientes sin cocinar */}
          <motion.button
            type="button"
            onClick={() => onSelectType('ingredients')}
            className="relative group p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 cursor-pointer text-left flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-green-100 dark:bg-green-900/50 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors flex-shrink-0">
                <Egg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">Ingredientes crudos</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Alimentos sin preparar</p>
              </div>
            </div>
          </motion.button>
        </div>
        
        <div className="mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] sm:text-xs text-white font-bold">💡</span>
            </span>
            <span className="text-xs sm:text-sm">
              <strong>Tip:</strong> Foto clara con buena iluminación.
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}