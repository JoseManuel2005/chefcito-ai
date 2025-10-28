// src/components/ShareMenu.tsx
import React from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Image as ImageIcon } from "lucide-react";

interface ShareMenuProps {
  onShareText: () => void;
  onCopyText: () => void;
  onShareImage: () => void;
}

/**
 * Menú desplegable para opciones de compartir
 */
export default function ShareMenu({ onShareText, onCopyText, onShareImage }: ShareMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute z-50 right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
    >
      <div className="p-2">
        {/* Compartir texto */}
        <button
          type="button"
          onClick={onShareText}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Compartir
        </button>

        {/* Copiar texto */}
        <button
          type="button"
          onClick={onCopyText}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          Copiar receta
        </button>

        {/* Compartir como imagen */}
        <button
          type="button"
          onClick={onShareImage}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          Compartir como imagen
        </button>
      </div>
    </motion.div>
  );
}
