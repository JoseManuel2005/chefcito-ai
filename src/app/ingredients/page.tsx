// app/ingredients/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ChefHat, AlertTriangle, Sparkles } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useTTS } from '@/hooks/useTTS';
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useTempMessage } from "@/hooks/useTempMessage";
import { useMenuToggle } from "@/hooks/useMenuToggle";
import { useIngredients } from "@/hooks/useIngredients";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import { useTheme } from "@/contexts/ThemeContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TempMessageToast from "@/components/TempMessageToast";
import ParticleBackground from "@/components/ParticleBackground";
import IngredientForm from "@/components/ingredients/IngredientForm";
import RecipeList from "@/components/ingredients/RecipeList";
import {
  containerVariants,
  mobileRecipeVariants,
  desktopRecipeVariants,
} from "@/utils/animations";

/**
 * Página principal para "Ingredientes → Recetas"
 * 
 * Esta página permite a los usuarios:
 * 1. Ingresar ingredientes manualmente, por voz o por imagen (OCR)
 * 2. Buscar recetas personalizadas basadas en esos ingredientes
 * 3. Ver, escuchar, compartir y guardar recetas como favoritos
 * 4. Generar visualizaciones de los platos
 * 
 * Arquitectura:
 * - Hooks personalizados manejan la lógica de negocio
 * - Componentes presentacionales manejan la UI
 * - Esta página solo orquesta y conecta las piezas
 * 
 * @page
 */
export default function IngredientsPage() {
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const { theme } = useTheme();
  const mainRef = useRef<HTMLElement | null>(null);

  // Hooks personalizados para lógica de negocio
  const ingredients = useIngredients();           // Gestión de ingredientes
  const recipeSearch = useRecipeSearch();         // Búsqueda de recetas
  const imageProcessing = useImageProcessing();   // OCR y generación de imágenes
  const tts = useTTS();                           // Text-to-speech
  const { tempMessage, tempMessageType, showError, showSuccess } = useTempMessage();
  const { openMenuIndex, setOpenMenuIndex } = useMenuToggle("menu");
  const { toggleFavorite: toggleFavoriteDb, isFavorite } = useFavoriteRecipes();

  // Estados locales (UI específica de esta página)
  const [isMobile, setIsMobile] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string>("");
  const [isVoiceFieldActive, setIsVoiceFieldActive] = useState(false);
  const [currentTTSIndex, setCurrentTTSIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1150);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Procesa el texto extraído de una imagen por OCR
   * Envía a OpenAI para limpiar y estructurar ingredientes
   */
  const handleOCRText = async (rawText: string) => {
    await imageProcessing.processOCRText(rawText, userPreferences, showError);
  };

  /**
   * Guarda los ingredientes detectados por imagen en la lista principal
   * Cierra el panel de chips editables
   */
  const handleSaveImageIngredients = () => {
    ingredients.addIngredientsFromList(imageProcessing.ingredientsFromImage);
    imageProcessing.cancelImageIngredients();
  };

  /**
   * Busca recetas combinando ingredientes manuales y de voz
   * Detiene audio TTS antes de buscar
   */
  const handleSearchRecipes = async (e: React.FormEvent) => {
    e.preventDefault();
    tts.stop();
    setCurrentTTSIndex(null);

    await recipeSearch.searchRecipes(
      ingredients.ingredients,
      voiceTranscription,
      userPreferences,
      showError
    );
  };

  /**
   * Resetea completamente el formulario y todos los estados
   * Útil para empezar una nueva búsqueda desde cero
   */
  const resetForm = () => {
    ingredients.resetIngredients();
    recipeSearch.resetSearch();
    setVoiceTranscription("");
    setIsVoiceFieldActive(false);
    tts.stop();
    setCurrentTTSIndex(null);
    imageProcessing.resetImages();
  };

  /**
   * En móvil, hace scroll automático a las recetas después de buscar
   * Mejora la UX mostrando los resultados inmediatamente
   */
  const scrollToRecipes = () => {
    if (isMobile && recipeSearch.recipes.length > 0) {
      setTimeout(() => {
        document.getElementById("recipes-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  useEffect(() => {
    if (isMobile && recipeSearch.recipes.length > 0 && !recipeSearch.loading) {
      scrollToRecipes();
    }
  }, [recipeSearch.recipes, recipeSearch.loading, isMobile]);

  if (isLoading) {
    return (
      <main
        ref={mainRef}
        className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
          theme === "dark" ? "dark bg-gray-950" : "bg-white"
        }`}
      >
        {/* Canvas de partículas */}
        <ParticleBackground theme={theme} />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar userPhoto={userPhoto} />
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 blur-md opacity-70 animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-slate-900 rounded-full shadow-lg">
                  <ChefHat className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Preparando tu cocina inteligente...
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
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        theme === "dark" ? "dark bg-gray-950" : "bg-white"
      }`}
    >
      {/* Canvas de partículas */}
      <ParticleBackground theme={theme} dependencies={[recipeSearch.recipes.length, recipeSearch.hasSearched]} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar userPhoto={userPhoto} />

        <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8 lg:py-3">
          <div className="max-w-6xl mx-auto">
            
            {/* Header con badge - más compacto */}
            <motion.div
              className="mb-8 md:mb-15 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge superior */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-gray-900 shadow-md backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/80 dark:text-gray-100 mb-4">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-yellow-500 dark:bg-gray-800">
                  <Utensils className="h-3 w-3" />
                </div>
                <span className="flex items-center gap-1">
                  Ingredientes → Recetas
                </span>
              </div>

              {/* Título principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                Cocina con lo que
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300">
                  ya tienes en casa.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Ingresa tus ingredientes manualmente, por voz o desde una imagen, y descubre recetas personalizadas al instante.
              </p>
            </motion.div>

            {/* Grid de formulario y recetas */}
            <div
              className={`${
                recipeSearch.hasSearched 
                  ? isMobile 
                    ? "flex flex-col space-y-8" 
                    : "grid grid-cols-2 gap-10 items-start"
                  : "flex justify-center"
              }`}
            >
              {/* Columna izquierda: Formulario */}
              <motion.div
                layout
                className={`${
                  recipeSearch.hasSearched 
                    ? isMobile ? "w-full" : "sticky top-6"
                    : "w-full max-w-3xl"
                }`}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Card del formulario con glass morphism */}
                <div className="relative">
                  {/* Glow detrás */}
                  <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-yellow-400/25 via-amber-200/10 to-transparent blur-3xl opacity-80 dark:from-yellow-500/25 dark:via-amber-300/10 dark:to-transparent" />
                  
                  <motion.div
                    layout
                    className="relative rounded-[2.5rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 transition-all duration-300"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <IngredientForm
                      ingredients={ingredients.ingredients}
                      onAddIngredient={() => {
                        recipeSearch.resetSearch();
                        ingredients.addIngredient();
                      }}
                      onChangeIngredientName={(value, index) => {
                        recipeSearch.resetSearch();
                        ingredients.updateIngredientName(value, index);
                      }}
                      onChangeIngredientExpiry={(value, index) => {
                        recipeSearch.resetSearch();
                        ingredients.updateIngredientExpiry(value, index);
                      }}
                      onRemoveIngredient={(index) => {
                        recipeSearch.resetSearch();
                        ingredients.removeIngredient(index);
                      }}
                      getDaysUntilExpiry={ingredients.getDaysUntilExpiry}
                      onSubmit={handleSearchRecipes}
                      onReset={resetForm}
                      loading={recipeSearch.loading}
                      isLoading={isLoading}
                      voiceTranscription={voiceTranscription}
                      setVoiceTranscription={setVoiceTranscription}
                      isVoiceFieldActive={isVoiceFieldActive}
                      setIsVoiceFieldActive={setIsVoiceFieldActive}
                      showImageChips={imageProcessing.showImageChips}
                      ingredientsFromImage={imageProcessing.ingredientsFromImage}
                      setIngredientsFromImage={imageProcessing.setIngredientsFromImage}
                      onSaveImageIngredients={handleSaveImageIngredients}
                      onCancelImageIngredients={imageProcessing.cancelImageIngredients}
                      onImageProcessed={handleOCRText}
                    />
                  </motion.div>
                </div>

                {/* Warning message */}
                <AnimatePresence>
                  {recipeSearch.warningMessage && (
                    <motion.div
                      className="mt-4 md:mt-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative rounded-2xl border border-red-200/70 bg-red-50/80 p-4 backdrop-blur-xl dark:border-red-800/80 dark:bg-red-900/20 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {recipeSearch.warningMessage}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Columna derecha: Recetas */}
              <AnimatePresence mode="popLayout">
                {(recipeSearch.hasSearched || recipeSearch.recipes.length > 0) && (
                  <motion.div
                    key="recipes-section"
                    id="recipes-section"
                    className={`${isMobile ? "w-full" : ""}`}
                    variants={isMobile ? mobileRecipeVariants : desktopRecipeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <RecipeList
                      recipes={recipeSearch.recipes}
                      loading={recipeSearch.loading}
                      isMobile={isMobile}
                      currentTTSIndex={currentTTSIndex}
                      setCurrentTTSIndex={setCurrentTTSIndex}
                      ttsStatus={tts.status}
                      ttsSpeak={tts.speak}
                      ttsPause={tts.pause}
                      ttsResume={tts.resume}
                      ttsStop={tts.stop}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavoriteDb}
                      showSuccess={showSuccess}
                      showError={showError}
                      openMenuIndex={openMenuIndex}
                      setOpenMenuIndex={setOpenMenuIndex}
                      dishImages={imageProcessing.dishImages}
                      showDishImage={imageProcessing.showDishImage}
                      loadingDishImage={imageProcessing.loadingDishImage}
                      generateDishImage={imageProcessing.generateDishImage}
                    />
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