// src/app/recipe-analysis/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useTempMessage } from "@/hooks/useTempMessage";
import { useTTS } from "@/hooks/useTTS";
import { useStepVisualization } from "@/hooks/useStepVisualization";
import { useTheme } from "@/contexts/ThemeContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TempMessageToast from "@/components/TempMessageToast";
import ParticleBackground from "@/components/ParticleBackground";
import RecipeAnalysisForm from "@/components/recipe-analysis/RecipeAnalysisForm";
import AnalysisResult from "@/components/recipe-analysis/AnalysisResult";
import { mobileAnalysisVariants, desktopAnalysisVariants } from "@/utils/animations";

/**
 * Página de análisis de recetas (Receta → Análisis)
 * 
 * Permite a los usuarios:
 * 1. Ingresar nombre de receta manualmente o por voz
 * 2. Subir foto de un plato para identificarlo automáticamente
 * 3. Obtener análisis detallado con ingredientes, pasos y tiempos
 * 4. Escuchar, compartir y guardar recetas como favoritos
 * 
 * Arquitectura:
 * - Hooks personalizados manejan la lógica de negocio
 * - Componentes presentacionales manejan la UI
 * - Esta página solo orquesta y conecta las piezas
 * 
 * @page
 */
export default function RecipeAnalysisPage() {
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const { theme } = useTheme();
  const mainRef = useRef<HTMLElement | null>(null);

  // Estados principales
  const [recipe, setRecipe] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState("");
  const [lastSearchedRecipe, setLastSearchedRecipe] = useState("");

  // Estados para identificación de plato por imagen
  const [dishNameFromImage, setDishNameFromImage] = useState<string>("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [showDishEdit, setShowDishEdit] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [pendingDishImage, setPendingDishImage] = useState<File | null>(null);

  // Hooks personalizados
  const tts = useTTS();
  const { toggleFavorite, isFavorite } = useFavoriteRecipes();
  const { tempMessage, tempMessageType, showError, showSuccess } = useTempMessage();
  const { stepImages, loadingSteps, generateStepImage } = useStepVisualization();
  const [menuOpen, setMenuOpen] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1150);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar menú al hacer clic fuera
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

  /**
   * Convertir archivo a base64 para enviar a la API
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "");
      reader.onerror = reject;
    });
  };

  /**
   * Confirma y envía la imagen del plato para identificación
   */
  const confirmDishImage = async (file: File) => {
    if (!file) return;

    setIsIdentifying(true);
    setPendingDishImage(file); // Actualizar estado para referencia

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/identify-dish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();

      if (res.ok && data.dishName) {
        setDishNameFromImage(data.dishName);
        setConfidence(data.confidence ?? null);
        setShowDishEdit(true);
      } else {
        showError(data.error || "No se pudo identificar el plato.");
        setPendingDishImage(null);
      }
    } catch (err: any) {
      showError("Error al procesar la imagen.");
      setPendingDishImage(null);
    } finally {
      setIsIdentifying(false);
    }
  };

  /**
   * Analiza la receta identificada desde la imagen
   */
  const handleAnalyzeFromImage = () => {
    setRecipe(dishNameFromImage);
    setShowDishEdit(false);
  };

  /**
   * Cancela la edición del nombre del plato identificado
   */
  const handleCancelDishEdit = () => {
    setShowDishEdit(false);
  };

  /**
   * Maneja el envío del formulario para analizar la receta
   */
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
        recipe: cleanRecipe,
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
        showError(
          errorData.error || "Demasiadas solicitudes. Por favor, espera 1 minuto.",
          5000
        );
        return;
      }

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      setAnalysis(data.analysis || null);
    } catch (error) {
      console.error("Error:", error);
      showError("Hubo un error al analizar la receta. Por favor, intenta de nuevo.", 5000);
      setAnalysis({
        receta: cleanRecipe,
        ingredientes: [],
        comentario: "Hubo un error al analizar la receta. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extrae el nombre de la receta de la transcripción de voz
   */
  const extractRecipeName = (transcribedText: string): string => {
    const cleaned = transcribedText
      .toLowerCase()
      .replace(
        /^(¿cómo se (hace|prepara)|receta de|dime cómo hacer|enséñame a preparar|quiero (hacer|la receta de)|hazme|necesito|podrías hacerme)\s*/i,
        ""
      )
      .replace(/[?¿!¡.,;:"]/g, "")
      .trim();
    if (cleaned.length < 2 || !/[a-záéíóúñ]/.test(cleaned)) return "";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  /**
   * Resetea completamente el formulario
   */
  const resetForm = () => {
    setRecipe("");
    setAnalysis(null);
    setHasSearched(false);
    setVoiceTranscription("");
    setLastSearchedRecipe("");
    setDishNameFromImage("");
    setConfidence(null);
    setShowDishEdit(false);
    setPendingDishImage(null);
    tts.stop();
  };

  /**
   * Scroll automático al análisis en móvil
   */
  const scrollToAnalysis = () => {
    if (isMobile && analysis) {
      setTimeout(() => {
        document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  useEffect(() => {
    if (isMobile && analysis && !loading) {
      scrollToAnalysis();
    }
  }, [analysis, loading, isMobile]);

  // Resetear análisis si cambia la búsqueda
  useEffect(() => {
    if (hasSearched && recipe.trim() !== lastSearchedRecipe) {
      setAnalysis(null);
      setHasSearched(false);
      setLastSearchedRecipe("");
    }
  }, [recipe, hasSearched, lastSearchedRecipe]);

  /**
   * Maneja las acciones de TTS (reproducir/pausar/reanudar)
   */
  const handleTTSAction = () => {
    if (tts.status === "playing") {
      tts.pause();
    } else if (tts.status === "paused") {
      tts.resume();
    } else {
      const ttsText = `
        Receta: ${analysis.receta || "Sin nombre"}.
        Ingredientes: ${analysis.ingredientes?.join(", ") || "No especificados"}.
        Preparación: ${analysis.pasos?.map((p: string, i: number) => `${i + 1}. ${p}`).join(" ") ||
        "No especificada"
        }.
      `
        .replace(/\s+/g, " ")
        .trim();
      tts.speak(ttsText);
    }
  };

  /**
   * Genera las imágenes del paso a paso
   */
  const handleGenerateSteps = () => {
    if (!analysis || !analysis.pasos) return;
    // Usamos un ID único para el análisis
    generateStepImage("analysis", analysis.pasos);
  };

  /**
   * Maneja el toggle de favoritos
   */
  const handleToggleFavorite = async () => {
    const nombre = analysis.receta || "Análisis de receta";
    const ingredientes = (analysis.ingredientes || []) as string[];
    const data = {
      nombre,
      ingredientes,
      pasos: (analysis.pasos || []) as string[],
      tiempo: (analysis.tiempo || "") as string,
    };
    const wasFav = isFavorite(nombre, ingredientes);
    const ok = await toggleFavorite(data);
    if (!ok) {
      showError("Inicia sesión para guardar favoritos", 4000);
      return;
    }
    if (wasFav) {
      showError("Eliminado de favoritos");
    } else {
      showSuccess("Agregado a favoritos");
    }
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <main
        ref={mainRef}
        className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${theme === "dark" ? "dark bg-gray-950" : "bg-white"
          }`}
      >
        <ParticleBackground theme={theme} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar userPhoto={userPhoto} />
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 via-emerald-300 to-green-200 blur-md opacity-70 animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-slate-900 rounded-full shadow-lg">
                  <BookOpen className="w-8 h-8 text-emerald-300" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Preparando el análisis de recetas...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainRef}
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${theme === "dark" ? "dark bg-gray-950" : "bg-white"
        }`}
    >
      {/* Canvas de partículas */}
      <ParticleBackground theme={theme} dependencies={[analysis, hasSearched]} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar userPhoto={userPhoto} />

        <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8 lg:py-3">
          <div className="max-w-6xl mx-auto">
            {/* Header con badge */}
            <motion.div
              className="mb-8 md:mb-15 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge superior */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-gray-900 shadow-md backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/80 dark:text-gray-100 mb-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-green-400 dark:bg-gray-800">
                  <BookOpen className="h-3 w-3" />
                </div>
                <span className="flex items-center gap-1">Receta → Análisis</span>
              </div>

              {/* Título principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                Descubre los ingredientes de
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-400 to-green-300">
                  cualquier receta
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Ingresa el nombre de una receta o sube una foto del plato para obtener un
                análisis detallado con ingredientes, pasos y tiempos de preparación.
              </p>
            </motion.div>

            {/* Grid de formulario y análisis */}
            <div
              className={`${hasSearched
                  ? isMobile
                    ? "flex flex-col space-y-8"
                    : "grid grid-cols-2 gap-10 items-start"
                  : "flex justify-center"
                }`}
            >
              {/* Columna izquierda: Formulario */}
              <motion.div
                layout
                className={`${hasSearched ? (isMobile ? "w-full" : "sticky top-6") : "w-full max-w-3xl"
                  }`}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <RecipeAnalysisForm
                  recipe={recipe}
                  setRecipe={setRecipe}
                  voiceTranscription={voiceTranscription}
                  setVoiceTranscription={setVoiceTranscription}
                  pendingDishImage={pendingDishImage}
                  setPendingDishImage={setPendingDishImage}
                  isIdentifying={isIdentifying}
                  showDishEdit={showDishEdit}
                  dishNameFromImage={dishNameFromImage}
                  setDishNameFromImage={setDishNameFromImage}
                  confidence={confidence}
                  onConfirmDishImage={confirmDishImage}
                  onCancelDishEdit={handleCancelDishEdit}
                  onAnalyzeFromImage={handleAnalyzeFromImage}
                  onSubmit={handleAnalyzeRecipe}
                  onReset={resetForm}
                  loading={loading}
                  extractRecipeName={extractRecipeName}
                />
              </motion.div>

              {/* Columna derecha: Análisis */}
              <AnimatePresence mode="popLayout">
                {hasSearched && (
                  <motion.div
                    key="analysis-section"
                    id="analysis-section"
                    className={`${isMobile ? "w-full" : ""}`}
                    variants={isMobile ? mobileAnalysisVariants : desktopAnalysisVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {loading ? (
                      <motion.div className="flex items-center justify-center py-12 md:py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-center">
                          <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 via-green-300 to-green-200 blur-md opacity-70 animate-pulse" />
                            <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-900 dark:bg-slate-900 rounded-full shadow-lg">
                              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-green-300 animate-bounce" />
                            </div>
                          </div>
                          <motion.p
                            className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Analizando plato...
                          </motion.p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Esto puede tomar unos segundos
                          </p>
                        </div>
                      </motion.div>
                    ) : analysis ? (
                      <AnalysisResult
                        analysis={analysis}
                        isMobile={isMobile}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                        ttsStatus={tts.status}
                        onTTSAction={handleTTSAction}
                        isFavorite={isFavorite(analysis.receta || "Análisis de receta", analysis.ingredientes || [])}
                        onToggleFavorite={handleToggleFavorite}
                        showSuccess={showSuccess}
                        showError={showError}
                        stepImages={stepImages["analysis"] || []}
                        loadingSteps={!!loadingSteps["analysis"]}
                        onGenerateSteps={handleGenerateSteps}
                      />
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <TempMessageToast message={tempMessage} type={tempMessageType} />
    </main>
  );
}