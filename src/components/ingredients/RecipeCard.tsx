"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChefHat,
  Clock,
  Volume2,
  Pause,
  Heart,
  Share2,
  ImageIcon,
  Eye,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import ShareMenu from "@/components/ShareMenu";
import { useRecipeVideo } from "@/hooks/useRecipeVideo";
import StepCarousel from "@/components/StepCarousel";
import Tooltip from "@/components/Tooltip";
import type { Recipe } from "@/hooks/useRecipeSearch";

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  isMobile: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  currentTTSIndex: number | null;
  ttsStatus: string;
  onTTSClick: () => void;
  openMenuIndex: number | null;
  setOpenMenuIndex: (index: number | null) => void;
  onShareText: () => void;
  onCopyText: () => void;
  onShareImage: () => void;
  dishImage: string | undefined;
  showDishImage: boolean;
  loadingDishImage: boolean;
  onGenerateImage: () => void;
  stepImages?: string[];
  loadingSteps?: boolean;
  onGenerateSteps?: () => void;
}

export default function RecipeCard({
  recipe,
  index,
  isMobile,
  isFavorite,
  onToggleFavorite,
  currentTTSIndex,
  ttsStatus,
  onTTSClick,
  openMenuIndex,
  setOpenMenuIndex,
  onShareText,
  onCopyText,
  onShareImage,
  dishImage,
  showDishImage,
  loadingDishImage,
  onGenerateImage,
  stepImages = [],
  loadingSteps = false,
  onGenerateSteps,
}: RecipeCardProps) {
  const nombreReceta = recipe.nombre || `Receta ${index + 1}`;

  const [isFlipped, setIsFlipped] = useState(false);

  const { isGenerating, videoUrl, generateVideo } = useRecipeVideo();
  const [showVideoModal, setShowVideoModal] = useState(false);

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

    const ttsText = `Receta: ${nombreReceta}. ${recipe.pasos?.join(". ") || ""
      }`;
    const estimatedDuration = estimateDurationSeconds(ttsText);

    const audioRes = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: ttsText }),
    });

    const audioBlob = await audioRes.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    await generateVideo(stepImages, audioUrl, nombreReceta, estimatedDuration);
    setShowVideoModal(true);
  };

  const handleFlipCard = () => {
    if (!isFlipped && onGenerateSteps && stepImages.length === 0) {
      onGenerateSteps();
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.1 }}
        style={{ perspective: "2000px" }}
      >
        {/* glow */}
        <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-amber-400/20 via-amber-200/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* flip container */}
        <motion.div
          className="relative w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRENTE */}
          <div
            className="relative rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_12px_50px_rgba(0,0,0,0.4)] p-6 md:p-8 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_20px_70px_rgba(0,0,0,0.6)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0"
                whileHover={{ rotate: 5 }}
              >
                <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                    {nombreReceta}
                  </h4>
                  <div className="flex items-center gap-1">
                    <div className="relative flex items-center" id={`menu-${index}`}>
                      <Tooltip content="Compartir receta" colorClass="bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-800">
                        <motion.button
                          type="button"
                          onClick={() =>
                            setOpenMenuIndex(
                              openMenuIndex === index ? null : index
                            )
                          }
                          className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Más opciones"
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.button>
                      </Tooltip>
                      {openMenuIndex === index && (
                        <ShareMenu
                          onShareText={onShareText}
                          onCopyText={onCopyText}
                          onShareImage={onShareImage}
                        />
                      )}
                    </div>

                    <Tooltip
                      content={
                        currentTTSIndex === index && ttsStatus === "playing"
                          ? "Pausar lectura"
                          : "Reproducir receta"
                      }
                      colorClass="bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                    >
                      <motion.button
                        type="button"
                        onClick={onTTSClick}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          currentTTSIndex === index && ttsStatus === "playing"
                            ? "Pausar lectura"
                            : "Leer receta"
                        }
                      >
                        {currentTTSIndex === index &&
                          ttsStatus === "loading" ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : currentTTSIndex === index &&
                          ttsStatus === "playing" ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </motion.button>
                    </Tooltip>

                    <Tooltip
                      content={
                        dishImage
                          ? (showDishImage ? "Ocultar imagen" : "Mostrar imagen")
                          : "Generar imagen del plato"
                      }
                      colorClass="bg-purple-600 text-white dark:bg-purple-500 dark:text-white"
                    >
                      <motion.button
                        type="button"
                        onClick={onGenerateImage}
                        className="p-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          dishImage
                            ? "Ver/Ocultar imagen"
                            : "Generar imagen del plato"
                        }
                      >
                        {loadingDishImage ? (
                          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        ) : dishImage ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                    </Tooltip>

                    <Tooltip
                      content={
                        isFavorite
                          ? "Quitar de favoritos"
                          : "Agregar a favoritos"
                      }
                      colorClass="bg-yellow-500 text-gray-900 dark:bg-yellow-400 dark:text-gray-900"
                    >
                      <motion.button
                        type="button"
                        onClick={onToggleFavorite}
                        className="p-1.5 rounded-full transition-colors cursor-pointer group hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          isFavorite
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                        }
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${isFavorite
                              ? "text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                            }`}
                        />
                      </motion.button>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    {recipe.tiempo || "Tiempo no estimado"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="col-span-1"
              >
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                  Ingredientes:
                </h5>
                <ul className="space-y-1 md:space-y-2">
                  {(recipe.ingredientes || []).map(
                    (ing: string, i: number) => (
                      <motion.li
                        key={i}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: 0.5 + index * 0.1 + i * 0.05,
                        }}
                      >
                        <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                        {ing}
                      </motion.li>
                    )
                  )}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="col-span-2 md:ml-5"
              >
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                  Preparación:
                </h5>
                <ol className="space-y-1 md:space-y-2">
                  {(recipe.pasos || []).map((paso: string, i: number) => (
                    <motion.li
                      key={i}
                      className="flex gap-2 md:gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.6 + index * 0.1 + i * 0.05,
                      }}
                    >
                      <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{paso}</span>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </div>

            {showDishImage && dishImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={`data:image/png;base64,${dishImage}`}
                  alt={`Imagen de ${recipe.nombre}`}
                  className="w-full max-h-64 object-cover"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center">
                  Imagen generada con IA • SynthID
                </p>
              </motion.div>
            )}

            {/* flip button */}
            <div className="mt-6 flex justify-center">
              <motion.button
                type="button"
                onClick={handleFlipCard}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-medium 
                  bg-yellow-500 text-white shadow-lg 
                  hover:from-amber-600 hover:to-amber-500 hover:shadow-xl
                  dark:text-gray-900
                  transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(251, 191, 36, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Ver guía visual interactiva
              </motion.button>
            </div>
          </div>
          
          {/* REVERSO */}
          <div
            className="absolute inset-0 rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_12px_50px_rgba(0,0,0,0.4)] p-6 md:p-8 overflow-hidden flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header reverso */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Guía Visual - {nombreReceta}
              </h4>

              <div className="flex items-center gap-2">
                {/* botón de video */}
                <Tooltip
                  content={videoUrl ? "Ver video" : "Generar video de preparación"}
                  colorClass="bg-green-600 text-white dark:bg-green-500 dark:text-white"
                >
                  <motion.button
                    type="button"
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || loadingSteps || stepImages.length === 0}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-green-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </motion.button>
                </Tooltip>

                <Tooltip content="Volver a la receta" colorClass="bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800">
                  <motion.button
                    type="button"
                    onClick={handleFlipCard}
                    className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: -180 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Volver a la receta"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </Tooltip>
              </div>
            </div>

            {/* Contenido principal del reverso: carrusel / loader */}
            <div className="flex-1 min-h-0">
              {loadingSteps ? (
                <div className="flex h-full flex-col items-center justify-center py-6">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Generando imágenes de preparación...
                  </p>
                </div>
              ) : stepImages.length > 0 ? (
                <div className="h-full">
                  <StepCarousel steps={recipe.pasos || []} images={stepImages} />
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* MODAL DE VIDEO */}
      {showVideoModal && videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-gray-950/95 border border-gray-700 shadow-2xl p-4 md:p-6">
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar video"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg md:text-xl font-semibold text-white mb-4 pr-10">
              Video de preparación - {nombreReceta}
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
              download={`${nombreReceta.replace(/\s+/g, "_")}.mp4`}
              className="flex items-center justify-center gap-2.5 w-full py-3 text-sm font-medium
                         text-white bg-gradient-to-r from-green-600 to-green-500
                         hover:from-green-500 hover:to-green-400
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
    </>
  );
}
