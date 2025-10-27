// app/recipe-analysis/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import VoiceRecorder from '@/components/VoiceRecorder/VoiceRecorder';
import {
  BookOpen,
  Search,
  Clock,
  Volume2,
  Pause,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useTempMessage } from "@/hooks/useTempMessage";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TempMessageToast from "@/components/TempMessageToast";
import ShareMenu from "@/components/ShareMenu";
import { useTTS } from '@/hooks/useTTS';
import {
  formatRecipeForText,
  copyToClipboard,
  shareSmart,
  shareRecipeAsImage,
} from "@/utils/shareUtils";
import {
  containerVariants,
  itemVariants,
  mobileAnalysisVariants,
  desktopAnalysisVariants,
} from "@/utils/animations";

export default function RecipeAnalysisPage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();

  const [recipe, setRecipe] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState("");
  const tts = useTTS();
  const [currentTTSIndex, setCurrentTTSIndex] = useState<number | null>(null);
  const [lastSearchedRecipe, setLastSearchedRecipe] = useState("");
  const { toggleFavorite, isFavorite } = useFavoriteRecipes();

  // Hooks personalizados
  const { tempMessage, tempMessageType, showError, showSuccess } = useTempMessage();

  // Menú compacto (solo hay 1 card aquí)
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("analysis-share-menu");
      if (!el) return setMenuOpen(false);
      if (!el.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleAnalyzeRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRecipe = recipe.trim();
    if (!cleanRecipe || cleanRecipe.length < 3) return;

    setLoading(true);
    setAnalysis(null);
    setHasSearched(true);
    setLastSearchedRecipe(cleanRecipe);

    try {
      const payload = {
        recipe: recipe.trim(),
        userPreferences: userPreferences || {
          allergies: [],
          preferredCuisines: [],
          country: "",
        },
      };

      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        showError(errorData.error || "Demasiadas solicitudes. Por favor, espera 1 minuto.", 5000);
        return;
      }

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      setAnalysis(data.analysis || null);
    } catch (error) {
      console.error("Error:", error);
      showError("Hubo un error al analizar la receta. Por favor, intenta de nuevo.", 5000);
      setAnalysis({
        receta: recipe,
        ingredientes: [],
        comentario: "Hubo un error al analizar la receta. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractRecipeName = (transcribedText: string): string => {
    const cleaned = transcribedText
      .toLowerCase()
      .replace(/^(¿cómo se (hace|prepara)|receta de|dime cómo hacer|enséñame a preparar|quiero (hacer|la receta de)|hazme|necesito|podrías hacerme)\s*/i, "")
      .replace(/[?¿!¡.,;:"]/g, "")
      .trim();
    if (cleaned.length < 2 || !/[a-záéíóúñ]/.test(cleaned)) return "";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const resetForm = () => {
    setRecipe("");
    setAnalysis(null);
    setHasSearched(false);
    setVoiceTranscription("");
    setLastSearchedRecipe("");
  };

  const scrollToAnalysis = () => {
    if (isMobile && analysis) {
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  useEffect(() => {
    if (isMobile && analysis && !loading) {
      scrollToAnalysis();
    }
  }, [analysis, loading, isMobile]);

  useEffect(() => {
    if (hasSearched && recipe.trim() !== lastSearchedRecipe) {
      setAnalysis(null);
      setHasSearched(false);
      setLastSearchedRecipe("");
    }
  }, [recipe, hasSearched, lastSearchedRecipe]);

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-5"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600 dark:text-gray-400">
              Cargando...
            </motion.p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar userPhoto={userPhoto} />
      <div className="flex-grow p-4 md:p-6">
        <motion.div
          className={`${hasSearched && !isMobile ? 'max-w-7xl' : 'max-w-4xl'} mx-auto transition-all duration-300 pt-0 md:pt-2`}
          initial={false}
          animate={{ maxWidth: hasSearched && !isMobile ? '1280px' : '896px' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Receta → Análisis</h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Descubre los ingredientes de cualquier receta</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className={`${isMobile ? 'flex flex-col space-y-6' : hasSearched ? 'flex flex-row gap-8 items-start' : 'flex flex-col items-center'}`}>
            {/* Form Section */}
            <motion.div
              layout
              className={`${isMobile ? 'w-full' : hasSearched ? 'w-1/2 sticky top-6' : 'w-full'}`}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                layout
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <form onSubmit={handleAnalyzeRecipe} className="space-y-4 md:space-y-6">
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
                        scale: (loading || !recipe.trim()) ? 1 : 1.02,
                        boxShadow: (loading || !recipe.trim()) ? "none" : "0 4px 12px rgba(34, 197, 94, 0.3)"
                      }}
                      whileTap={{ scale: (loading || !recipe.trim()) ? 1 : 0.98 }}
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
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 cursor-pointer dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>

            {/* Analysis Section */}
            <AnimatePresence mode="popLayout">
              {(hasSearched && analysis) && (
                <motion.div
                  key="analysis-section"
                  id="analysis-section"
                  className={`${isMobile ? 'w-full' : 'w-1/2 -mt-4'}`}
                  variants={isMobile ? mobileAnalysisVariants : desktopAnalysisVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {analysis ? (
                    <motion.div
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          className="w-10 h-10 md:w-12 md:h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0"
                          whileHover={{ rotate: 5 }}
                        >
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <motion.h4
                              className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              {analysis.receta || "Análisis de receta"}
                            </motion.h4>

                            {/* Botonera: Audio / Menú / Favorito */}
                            <div className="flex items-center gap-1">
                              {/* Menú compacto de compartir */}
                              <div className="relative" id="analysis-share-menu">
                                <motion.button
                                  type="button"
                                  onClick={() => setMenuOpen((v) => !v)}
                                  className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  aria-label="Más opciones"
                                  title="Compartir / Copiar"
                                >
                                  <MoreHorizontal className="w-5 h-5" />
                                </motion.button>

                                {menuOpen && (
                                  <ShareMenu
                                    onShareText={async () => {
                                      setMenuOpen(false);
                                      const shareText = formatRecipeForText(analysis);
                                      const ok = await shareSmart(shareText, analysis.receta || "Análisis de receta");
                                      if (ok) showSuccess("Hoja de compartir abierta", 1800);
                                    }}
                                    onCopyText={async () => {
                                      setMenuOpen(false);
                                      const shareText = formatRecipeForText(analysis);
                                      const ok = await copyToClipboard(shareText);
                                      ok ? showSuccess("Receta copiada", 1800) : showError("No se pudo copiar", 1800);
                                    }}
                                    onShareImage={async () => {
                                      setMenuOpen(false);
                                      await shareRecipeAsImage(analysis, 0, showSuccess, showError);
                                    }}
                                  />
                                )}
                              </div>

                              {/* TTS */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (tts.status === "playing") {
                                    tts.pause();
                                  } else if (tts.status === "paused") {
                                    tts.resume();
                                  } else {
                                    const ttsText = `
                                      Receta: ${analysis.receta || 'Sin nombre'}.
                                      Ingredientes: ${analysis.ingredientes?.join(', ') || 'No especificados'}.
                                      Preparación: ${analysis.pasos?.map((p: string, i: number) => `${i + 1}. ${p}`).join(' ') || 'No especificada'}.
                                    `.replace(/\s+/g, ' ').trim();
                                    tts.speak(ttsText);
                                  }
                                }}
                                className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                aria-label={tts.status === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
                              >
                                {tts.status === "loading" ? (
                                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                ) : tts.status === "playing" ? (
                                  <Pause className="w-5 h-5" />
                                ) : (
                                  <Volume2 className="w-5 h-5" />
                                )}
                              </button>

                              {/* Favorito */}
                              <button
                                type="button"
                                onClick={async () => {
                                  const nombre = analysis.receta || "Análisis de receta";
                                  const data = {
                                    nombre,
                                    ingredientes: (analysis.ingredientes || []) as string[],
                                    pasos: (analysis.pasos || []) as string[],
                                    tiempo: (analysis.tiempo || "") as string,
                                  };
                                  const wasFav = isFavorite(nombre);
                                  const ok = await toggleFavorite(data);
                                  if (!ok) {
                                    showError("Inicia sesión para guardar favoritos", 4000);
                                    return;
                                  }
                                  showSuccess(wasFav ? "Eliminado de favoritos" : "Agregado a favoritos");
                                }}
                                className={`p-1.5 rounded-full transition-colors cursor-pointer group hover:bg-green-50 dark:hover:bg-green-900/20`}
                                aria-label={isFavorite(analysis.receta || "Análisis de receta") ? "Quitar de favoritos" : "Agregar a favoritos"}
                              >
                                <Heart
                                  className={`w-5 h-5 transition-colors ${isFavorite(analysis.receta || "Análisis de receta")
                                      ? "text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400"
                                      : "text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                                    }`}
                                />
                              </button>
                            </div>
                          </div>

                          <motion.div
                            className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{analysis.tiempo || "Tiempo no estimado"}</span>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Layout */}
                      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6'}`}>
                        {/* Columna principal */}
                        <div className={isMobile ? '' : 'space-y-6'}>
                          {/* Ingredientes */}
                          <motion.div initial={{ opacity: 0, y: isMobile ? 20 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">Ingredientes:</h5>
                            <div className="space-y-2">
                              {(analysis.ingredientes || []).map((ing: string, i: number) => (
                                <motion.div
                                  key={i}
                                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                  initial={{ opacity: 0, x: isMobile ? -10 : 0 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.05 }}
                                  whileHover={{ x: isMobile ? 0 : 5 }}
                                >
                                  <motion.div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" whileHover={{ scale: 1.5 }} />
                                  <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{ing}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Pasos */}
                          {analysis.pasos && analysis.pasos.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: isMobile ? 20 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">Cómo prepararla:</h5>
                              <ol className="space-y-2">
                                {(analysis.pasos || []).map((paso: string, i: number) => (
                                  <motion.li
                                    key={i}
                                    className="flex gap-2 md:gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    initial={{ opacity: 0, y: isMobile ? 10 : 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + i * 0.05 }}
                                  >
                                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{paso}</span>
                                  </motion.li>
                                ))}
                              </ol>
                            </motion.div>
                          )}
                        </div>

                        {/* Columna secundaria */}
                        {analysis.comentario && (
                          <motion.div initial={{ opacity: 0, y: isMobile ? 20 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="lg:sticky lg:top-6">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">Notas adicionales:</h5>
                            <motion.div
                              className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.1 }}
                            >
                              <p className="text-blue-800 dark:text-blue-300 text-xs md:text-sm leading-relaxed">
                                {analysis.comentario}
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : loading ? (
                    <motion.div className="flex items-center justify-center py-8 md:py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-center">
                        <motion.div
                          className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full mb-3 md:mb-4"
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                        >
                          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </motion.div>
                        <motion.p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                          Analizando receta...
                        </motion.p>
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <TempMessageToast message={tempMessage} type={tempMessageType} />

      <Footer />
    </main>
  );
}
