"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, X, Volume2, Pause, Utensils, UtensilsCrossed, ImageIcon, Eye, Play, RotateCcw } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { useEffect, useState } from "react";
import ChiefLogo from "@/components/ChiefLogo";
import StepCarousel from "@/components/StepCarousel";
import { useRecipeVideo } from "@/hooks/useRecipeVideo";

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
  dishImage?: string;
  showDishImage?: boolean;
  loadingDishImage?: boolean;
  onGenerateImage?: () => void;
  stepImages?: string[];
  loadingSteps?: boolean;
  onGenerateSteps?: () => void;
};

export default function RecipeDetailModal({ 
  recipe, 
  isOpen, 
  onClose, 
  index,
  dishImage,
  showDishImage = false,
  loadingDishImage = false,
  onGenerateImage,
  stepImages = [],
  loadingSteps = false,
  onGenerateSteps,
}: RecipeDetailModalProps) {
  const tts = useTTS();
  const [isFlipped, setIsFlipped] = useState(false);
  const { isGenerating, videoUrl, generateVideo } = useRecipeVideo();
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Debug: verificar props
  useEffect(() => {
    if (isOpen) {
      console.log("RecipeDetailModal props:", {
        dishImage: dishImage ? `${dishImage.substring(0, 50)}...` : undefined,
        showDishImage,
        loadingDishImage,
        hasOnGenerateImage: !!onGenerateImage
      });
    }
  }, [isOpen, dishImage, showDishImage, loadingDishImage, onGenerateImage]);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    setIsFlipped(false);
    onClose();
  };

  const handleFlipCard = () => {
    if (!isFlipped && onGenerateSteps && stepImages.length === 0) {
      onGenerateSteps();
    }
    setIsFlipped(!isFlipped);
  };

  const estimateDurationSeconds = (text: string): number => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(8, Math.min(45, words / 2.5));
  };

  const handleGenerateVideo = async () => {
    if (stepImages.length === 0 || loadingSteps) return;

    // Si ya hay video, solo mostramos el modal
    if (videoUrl) {
      setShowVideoModal(true);
      return;
    }

    const nombreReceta = recipe.nombre || `Receta ${(index ?? 0) + 1}`;
    const ttsTextVideo = `Receta: ${nombreReceta}. ${recipe.pasos?.join(". ") || ""}`;
    const estimatedDuration = estimateDurationSeconds(ttsTextVideo);

    const audioRes = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: ttsTextVideo }),
    });

    const audioBlob = await audioRes.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    await generateVideo(stepImages, audioUrl, nombreReceta, estimatedDuration);
    setShowVideoModal(true);
  };

  return (
    <>
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
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ perspective: "2000px" }}
          >
            {/* flip container */}
            <motion.div
              className="relative w-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRENTE */}
              <div
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl max-h-[90vh] border border-white/60 dark:border-gray-800/80 flex flex-col"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gray-900 text-amber-300 shadow-lg dark:bg-gray-800 shrink-0">
                  <ChiefLogo className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {recipe.nombre || `Receta ${(index ?? 0) + 1}`}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400 mt-1 md:mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{(recipe.tiempo || "No estimado").replace(/minutos?/gi, 'min')}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>{recipe.ingredientes?.length || 0} ing</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de Acción */}
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {/* Botón de Guía Visual */}
                <motion.button
                  type="button"
                  onClick={handleFlipCard}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-md hover:from-amber-600 hover:to-amber-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Ver guía visual interactiva"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Guía Visual</span>
                  <span className="md:hidden">Guía</span>
                </motion.button>

                {/* Botón de TTS (Escuchar) */}
                <motion.button
                  type="button"
                  onClick={handleTTSToggle}
                  className="p-2 md:p-2.5 text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tts.status === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
                  title={tts.status === "playing" ? "Pausar" : "Escuchar receta"}
                >
                  {tts.status === "loading" ? (
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  ) : tts.status === "playing" ? (
                    <Pause className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </motion.button>

                {/* Botón de Generación de Imagen */}
                {onGenerateImage && (
                  <motion.button
                    type="button"
                    onClick={onGenerateImage}
                    className="p-2 md:p-2.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={dishImage ? "Ver/Ocultar imagen" : "Generar imagen del plato"}
                    title={dishImage ? "Ver/Ocultar imagen" : "Generar imagen del plato"}
                  >
                    {loadingDishImage ? (
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : dishImage ? (
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </motion.button>
                )}

                {/* Botón de Cerrar */}
                <motion.button
                  onClick={handleClose}
                  className="p-2 md:p-2.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Ingredientes */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-4 md:p-5 border border-gray-200/60 dark:border-gray-700/60">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                    Ingredientes
                  </h3>
                  <ul className="space-y-2 md:space-y-2.5">
                    {(recipe.ingredientes || []).map((ing: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3 text-gray-700 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0 mt-1.5 md:mt-2" />
                        <span className="text-xs md:text-sm leading-relaxed">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pasos de Preparación */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-4 md:p-5 border border-gray-200/60 dark:border-gray-700/60">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                    Preparación
                  </h3>
                  <ol className="space-y-3 md:space-y-4">
                    {(recipe.pasos || []).map((paso: string, i: number) => (
                      <li key={i} className="flex gap-2 md:gap-3">
                        <span className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 text-pink-700 dark:text-pink-300 text-[10px] md:text-xs font-bold rounded-full shrink-0 shadow-sm">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm leading-relaxed pt-0.5">
                          {paso}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Imagen del plato generada */}
              {showDishImage && dishImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 md:mt-6 rounded-xl md:rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur"
                >
                  <img
                    src={`data:image/png;base64,${dishImage}`}
                    alt={`Imagen de ${recipe.nombre}`}
                    className="w-full max-h-64 md:max-h-96 object-cover"
                  />
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 p-2 md:p-3 text-center">
                    Imagen generada con IA • SynthID
                  </p>
                </motion.div>
              )}

              {/* Botón para flip (solo móvil pequeño) */}
              <div className="mt-4 md:mt-6 flex justify-center sm:hidden">
                <motion.button
                  type="button"
                  onClick={handleFlipCard}
                  className="group inline-flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-medium bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg hover:from-amber-600 hover:to-amber-500 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">Ver guía visual interactiva</span>
                </motion.button>
              </div>
            </div>
            {/* Fin del FRENTE */}
          </div>

          {/* REVERSO */}
          <div
            className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/60 dark:border-gray-800/80 p-4 md:p-6 overflow-hidden flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              maxHeight: "90vh",
            }}
          >
            {/* Header reverso */}
            <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0 pb-3 md:pb-4 border-b border-gray-200/60 dark:border-gray-700/60">
              <h4 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
                Guía Visual - {recipe.nombre || `Receta ${(index ?? 0) + 1}`}
              </h4>

              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {/* Botón de video */}
                <motion.button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || loadingSteps || stepImages.length === 0}
                  className="p-1.5 md:p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/40 dark:hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  whileHover={{
                    scale:
                      isGenerating || loadingSteps || stepImages.length === 0 ? 1 : 1.05,
                  }}
                  whileTap={{
                    scale:
                      isGenerating || loadingSteps || stepImages.length === 0 ? 1 : 0.95,
                  }}
                  aria-label="Generar / ver video de preparación"
                >
                  {isGenerating ? (
                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleFlipCard}
                  className="p-1.5 md:p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -180 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Volver a la receta"
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Contenido principal del reverso: carrusel / loader */}
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)", WebkitOverflowScrolling: "touch" }}>
              {loadingSteps ? (
                <div className="flex h-full flex-col items-center justify-center py-4 md:py-6 px-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-2 md:border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2 md:mb-3" />
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                    Generando imágenes de preparación...
                  </p>
                </div>
              ) : stepImages.length > 0 ? (
                <div className="h-full">
                  <StepCarousel steps={recipe.pasos || []} images={stepImages} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-4 md:py-6 px-4">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center">
                    No hay imágenes de preparación disponibles
                  </p>
                </div>
              )}
            </div>
            {/* Fin del REVERSO */}
          </div>
          {/* Fin del flip container */}
        </motion.div>
        {/* Fin del motion.div con perspective */}
      </motion.div>
      {/* Fin del motion.div overlay */}
      </motion.div>
      )}
    </AnimatePresence>

    {/* MODAL DE VIDEO */}
    {showVideoModal && videoUrl && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-gray-950/95 border border-gray-700 shadow-2xl p-4 md:p-6">
          <button
            type="button"
            onClick={() => setShowVideoModal(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors"
            aria-label="Cerrar video"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 pr-10">
            Video de preparación - {recipe.nombre || `Receta ${(index ?? 0) + 1}`}
          </h3>

          <div className="relative bg-black rounded-xl overflow-hidden mb-4">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full max-h-[70vh] object-contain"
            />
          </div>

          <a
            href={videoUrl}
            download={`${(recipe.nombre || `Receta_${(index ?? 0) + 1}`).replace(/\s+/g, "_")}.mp4`}
            className="flex items-center justify-center gap-2.5 w-full py-3 text-sm font-medium
                       text-white bg-gradient-to-r from-amber-600 to-amber-500
                       hover:from-amber-500 hover:to-amber-400
                       rounded-xl transition-all duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Descargar video de preparación
          </a>
        </div>
      </div>
    )}
  </>);
}