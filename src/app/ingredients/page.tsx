// app/ingredients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Plus,
  Trash2,
  ChefHat,
  Search,
  Clock,
  Users,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function IngredientsPage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const [ingredients, setIngredients] = useState<
    { name: string; expiry?: string | null }[]
  >([{ name: "" }]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAddIngredient = () => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    setIngredients([...ingredients, { name: "", expiry: null }]);
  };

  const handleChangeIngredientName = (value: string, index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    const updated = [...ingredients];
    updated[index] = { ...updated[index], name: value };
    setIngredients(updated);
  };

  const handleChangeIngredientExpiry = (value: string, index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    const updated = [...ingredients];
    updated[index] = { ...updated[index], expiry: value || null };
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSearchRecipes = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    if (validIngredients.length === 0) return;

    setLoading(true);
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(true);

    try {
      const payload = {
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          expiry: ing.expiry,
        })),
        userPreferences: userPreferences || {
          allergies: [],
          preferredCuisines: [],
          country: "",
        },
      };

      console.log("Enviando preferencias al API:", payload.userPreferences);

      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
      if (data.warning) {
        setWarningMessage(data.warning);
      }
    } catch (error) {
      console.error("Error:", error);
      setWarningMessage(
        "Hubo un error al generar las recetas. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIngredients([{ name: "" }]);
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(false);
  };

  const scrollToRecipes = () => {
    if (isMobile && recipes.length > 0) {
      setTimeout(() => {
        document.getElementById("recipes-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  };

  // Efecto para scroll automático en móvil
  useEffect(() => {
    if (isMobile && recipes.length > 0 && !loading) {
      scrollToRecipes();
    }
  }, [recipes, loading, isMobile]);

  // Animaciones para móvil
  const mobileRecipeVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const, // Explicitly cast to ensure compatibility
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const desktopRecipeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const, // Explicitly cast to ensure compatibility
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5 animate-pulse">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar userPhoto={userPhoto} />
      <div className="flex-grow p-4 md:p-6">
        {/* En móvil: siempre una columna, en desktop: layout condicional */}
        <div
          className={`${
            hasSearched && !isMobile ? "max-w-380" : "max-w-4xl"
          } mx-auto transition-all duration-300 pt-0 md:pt-2`}
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
                className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Utensils className="w-5 h-5 text-yellow-600" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Ingredientes → Recetas
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Genera recetas con tus ingredientes disponibles
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contenido Principal */}
          {/* En móvil: siempre una columna */}
          {/* En desktop: dos columnas cuando hay búsqueda */}
          <div
            className={`
            ${
              isMobile
                ? "flex flex-col space-y-6"
                : hasSearched
                ? "flex flex-row gap-20 items-start"
                : "flex flex-col items-center"
            }
          `}
          >
            {/* Sección del Formulario */}
            <motion.div
              layout
              className={`
                ${
                  isMobile
                    ? "w-full"
                    : hasSearched
                    ? "w-1/2 sticky top-6"
                    : "w-full"
                }
              `}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                layout
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <form
                  onSubmit={handleSearchRecipes}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="space-y-3">
                    {ingredients.map((ingredient, index) => {
                      const daysUntil = getDaysUntilExpiry(ingredient.expiry ?? null);
                      const isExpiringSoon =
                        daysUntil !== null && daysUntil <= 2;
                      const isExpired = daysUntil !== null && daysUntil < 0;

                      return (
                        <motion.div
                          key={index}
                          className="flex flex-col gap-3"
                          variants={itemVariants}
                          layout
                        >
                          <div className="flex flex-col sm:flex-row gap-3 items-start">
                            {/* Input texto */}
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) =>
                                handleChangeIngredientName(
                                  e.target.value,
                                  index
                                )
                              }
                              className="flex-1 w-full px-4 py-3 border border-gray-200 rounded-lg text-black focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base"
                              placeholder="Ej: tomate, cebolla, pollo..."
                            />

                            {/* Grupo derecho: fecha + (etiqueta + botón) */}
                            <div className="flex flex-col sm:flex-row items-start gap-2 w-full sm:w-auto">
                              {/* Input fecha */}
                              <div className="relative w-full sm:w-auto min-w-[180px]">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="date"
                                  value={ingredient.expiry || ""}
                                  onChange={(e) =>
                                    handleChangeIngredientExpiry(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-black focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base"
                                  aria-label="Fecha de vencimiento (opcional)"
                                />
                              </div>

                              {/* Grupo etiqueta + botón */}
                              <div className="flex items-center gap-2 self-center sm:self-start">
                                <AnimatePresence>
                                  {isExpiringSoon && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                        isExpired
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {isExpired
                                        ? "Vencido"
                                        : `Vence en ${daysUntil} días`}
                                    </motion.span>
                                  )}
                                </AnimatePresence>

                                {ingredients.length > 1 && (
                                  <motion.button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveIngredient(index)
                                    }
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Trash2 className="w-5 h-5" />
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
                      onClick={handleAddIngredient}
                      className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-yellow-300 hover:text-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar ingrediente
                    </motion.button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      type="submit"
                      disabled={
                        loading ||
                        ingredients.every((ing) => ing.name.trim() === "") ||
                        isLoading
                      }
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      whileHover={{
                        scale:
                          loading ||
                          ingredients.every((ing) => ing.name.trim() === "") ||
                          isLoading
                            ? 1
                            : 1.02,
                        boxShadow:
                          loading ||
                          ingredients.every((ing) => ing.name.trim() === "") ||
                          isLoading
                            ? "none"
                            : "0 4px 12px rgba(251, 191, 36, 0.3)",
                      }}
                      whileTap={{
                        scale:
                          loading ||
                          ingredients.every((ing) => ing.name.trim() === "") ||
                          isLoading
                            ? 1
                            : 0.98,
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
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
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                  </div>
                </form>
              </motion.div>

              {/* Mensaje de Advertencia */}
              <AnimatePresence>
                {warningMessage && (
                  <motion.div
                    className="mt-4 md:mt-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">
                        {warningMessage}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sección de Recetas */}
            <AnimatePresence mode="popLayout">
              {(hasSearched || recipes.length > 0) && (
                <motion.div
                  key="recipes-section"
                  id="recipes-section"
                  className={`
                    ${isMobile ? "w-full" : "w-1/2 -mt-17"}
                  `}
                  variants={
                    isMobile ? mobileRecipeVariants : desktopRecipeVariants
                  }
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {recipes.length > 0 ? (
                    <motion.div className="space-y-4 md:space-y-6">
                      <motion.h3
                        className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4 md:mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Recetas sugeridas
                      </motion.h3>
                      {recipes.map((recipeItem, index) => (
                        <motion.div
                          key={index}
                          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ y: isMobile ? 0 : -2 }}
                        >
                          <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                            <motion.div
                              className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0"
                              whileHover={{ rotate: 5 }}
                            >
                              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                                {recipeItem.nombre || `Receta ${index + 1}`}
                              </h4>
                              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                  {recipeItem.tiempo || "Tiempo no estimado"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <h5 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">
                                Ingredientes:
                              </h5>
                              <ul className="space-y-1 md:space-y-2">
                                {(recipeItem.ingredientes || []).map(
                                  (ing: string, i: number) => (
                                    <motion.li
                                      key={i}
                                      className="flex items-center gap-2 text-gray-700 text-sm md:text-base"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{
                                        delay: 0.5 + index * 0.1 + i * 0.05,
                                      }}
                                    >
                                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0" />
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
                            >
                              <h5 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">
                                Preparación:
                              </h5>
                              <ol className="space-y-1 md:space-y-2">
                                {(recipeItem.pasos || []).map(
                                  (paso: string, i: number) => (
                                    <motion.li
                                      key={i}
                                      className="flex gap-2 md:gap-3 text-gray-700 text-sm md:text-base"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        delay: 0.6 + index * 0.1 + i * 0.05,
                                      }}
                                    >
                                      <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 text-yellow-700 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span>{paso}</span>
                                    </motion.li>
                                  )
                                )}
                              </ol>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      className="flex items-center justify-center py-8 md:py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <motion.div
                          className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#FFCB2B] rounded-full mb-3 md:mb-4"
                          animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            rotate: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            },
                            scale: { duration: 1, repeat: Infinity },
                          }}
                        >
                          <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </motion.div>
                        <motion.p
                          className="text-gray-600 font-medium text-sm md:text-base"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Generando recetas...
                        </motion.p>
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
