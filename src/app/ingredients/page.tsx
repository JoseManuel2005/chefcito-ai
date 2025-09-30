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
import { useUserData } from "@/hooks/useUserData"; // Hook personalizado para obtener datos del usuario desde Firebase
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/**
 * Página principal para la funcionalidad de "Ingredientes → Recetas".
 * Permite al usuario ingresar ingredientes (con fechas de vencimiento opcionales),
 * y enviarlos a una API para obtener recetas personalizadas según sus preferencias.
 */
export default function IngredientsPage() {
  const router = useRouter();
  // Obtiene datos del usuario autenticado: foto, preferencias (alergias, cocina favorita, país) y estado de carga
  const { userPhoto, userPreferences, isLoading } = useUserData();

  // Estado local para gestionar la lista de ingredientes ingresados por el usuario
  const [ingredients, setIngredients] = useState<
    { name: string; expiry?: string | null }[]
  >([{ name: "" }]);

  // Almacena las recetas generadas tras la búsqueda
  const [recipes, setRecipes] = useState<any[]>([]);

  // Indica si se está procesando la solicitud a la API
  const [loading, setLoading] = useState(false);

  // Mensaje de advertencia devuelto por la API (ej: ingredientes insuficientes)
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Indica si el usuario ya ha realizado al menos una búsqueda
  const [hasSearched, setHasSearched] = useState(false);

  // Detecta si la vista actual es en dispositivo móvil (ancho < 768px)
  const [isMobile, setIsMobile] = useState(false);

  // Mensaje temporal mostrado en pantalla (ej: errores, rate limiting)
  const [tempMessage, setTempMessage] = useState<string | null>(null);

  // Tipo de mensaje temporal: 'error' o 'success'
  const [tempMessageType, setTempMessageType] = useState<'error' | 'success'>('error');

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1150);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Agrega un nuevo ingrediente vacío a la lista.
   * Resetea advertencias y resultados previos.
   */
  const handleAddIngredient = () => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    setIngredients([...ingredients, { name: "", expiry: null }]);
  };

  /**
   * Actualiza el nombre de un ingrediente en una posición específica.
   * Resetea advertencias y resultados previos.
   */
  const handleChangeIngredientName = (value: string, index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    const updated = [...ingredients];
    updated[index] = { ...updated[index], name: value };
    setIngredients(updated);
  };

  /**
   * Actualiza la fecha de vencimiento de un ingrediente en una posición específica.
   * Resetea advertencias y resultados previos.
   */
  const handleChangeIngredientExpiry = (value: string, index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    const updated = [...ingredients];
    updated[index] = { ...updated[index], expiry: value || null };
    setIngredients(updated);
  };

  /**
   * Elimina un ingrediente de la lista (si hay más de uno).
   * Resetea advertencias y resultados previos.
   */
  const handleRemoveIngredient = (index: number) => {
    setWarningMessage(null);
    setRecipes([]);
    setHasSearched(false);
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  /**
   * Calcula cuántos días faltan para que expire un ingrediente.
   * @param expiryDate Fecha de vencimiento en formato ISO string o null
   * @returns Número de días (positivo = futuro, negativo = vencido), o null si no hay fecha
   */
  const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza a medianoche
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Envía los ingredientes y preferencias del usuario a la API para generar recetas.
   * Maneja errores, rate limiting (429) y muestra mensajes temporales.
   */
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

      // Manejo de rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        const errorData = await response.json();
        setTempMessage(errorData.error || "Demasiadas solicitudes. Por favor, espera 1 minuto.");
        setTempMessageType('error');
        setTimeout(() => setTempMessage(null), 5000);
        return;
      }

      if (!response.ok) {
        throw new Error("Error en la respuesta");
      }

      const data = await response.json();
      setRecipes(data.recipes || []);
      if (data.warning) {
        setWarningMessage(data.warning);
      }
    } catch (error) {
      console.error("Error:", error);
      setTempMessage("Hubo un error al generar las recetas. Por favor, intenta de nuevo.");
      setTempMessageType('error');
      setTimeout(() => setTempMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reinicia el formulario a su estado inicial.
   */
  const resetForm = () => {
    setIngredients([{ name: "" }]);
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(false);
  };

  /**
   * Desplaza suavemente la vista hacia la sección de recetas en móviles.
   */
  const scrollToRecipes = () => {
    if (isMobile && recipes.length > 0) {
      setTimeout(() => {
        document.getElementById("recipes-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  };

  // Efecto para scroll automático en móvil tras cargar recetas
  useEffect(() => {
    if (isMobile && recipes.length > 0 && !loading) {
      scrollToRecipes();
    }
  }, [recipes, loading, isMobile]);

  // Definición de variantes de animación para recetas en móvil
  const mobileRecipeVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const, // Cast explícito para compatibilidad con Framer Motion
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Variantes para contenedores con stagger (animación secuencial)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Variantes para elementos individuales dentro del contenedor
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

  // Variantes para recetas en escritorio (animación lateral)
  const desktopRecipeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
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

  // Renderizado de carga inicial mientras se obtienen datos del usuario
  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5 animate-pulse">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar userPhoto={userPhoto} />
      <div className="flex-grow p-4 md:p-6">
        {/* Contenedor principal con ancho condicional según estado de búsqueda y dispositivo */}
        <div
          className={`${hasSearched && !isMobile ? "max-w-380" : "max-w-4xl"
            } mx-auto transition-all duration-300 pt-0 md:pt-2`}
        >
          {/* Encabezado con ícono y título */}
          <motion.div
            className="flex items-center justify-between mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Utensils className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Ingredientes → Recetas
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Genera recetas con tus ingredientes disponibles
                </p>
              </div>
            </div>
          </motion.div>

          {/* Layout principal: columna en móvil, dos columnas en escritorio tras búsqueda */}
          <div
            className={`
            ${isMobile
                ? "flex flex-col space-y-6"
                : hasSearched
                  ? "flex flex-row gap-20 items-start"
                  : "flex flex-col items-center"
              }
          `}
          >
            {/* Sección del formulario de ingredientes */}
            <motion.div
              layout
              className={`
                ${isMobile
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 transition-colors duration-300"
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
                            {/* Input de nombre del ingrediente */}
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) =>
                                handleChangeIngredientName(
                                  e.target.value,
                                  index
                                )
                              }
                              className="flex-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Ej: tomate, cebolla, pollo..."
                            />

                            {/* Grupo de fecha de vencimiento y acciones */}
                            <div className="flex flex-col sm:flex-row items-start gap-2 w-full sm:w-auto">
                              {/* Input de fecha con ícono */}
                              <div className="relative w-full sm:w-auto min-w-[180px]">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                  type="date"
                                  value={ingredient.expiry || ""}
                                  onChange={(e) =>
                                    handleChangeIngredientExpiry(
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base cursor-pointer"
                                  aria-label="Fecha de vencimiento (opcional)"
                                />
                              </div>

                              {/* Etiqueta de vencimiento y botón de eliminar */}
                              <div className="flex items-center gap-2 self-center sm:self-start">
                                <AnimatePresence>
                                  {isExpiringSoon && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${isExpired
                                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
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
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
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

                    {/* Botón para agregar más ingredientes */}
                    <motion.button
                      type="button"
                      onClick={handleAddIngredient}
                      className="w-full py-3 border-2 cursor-pointer border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar ingrediente
                    </motion.button>
                  </div>

                  {/* Botones de acción: buscar y limpiar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      type="submit"
                      disabled={
                        loading ||
                        ingredients.every((ing) => ing.name.trim() === "") ||
                        isLoading
                      }
                      className="flex-1 dark:text-gray-800 cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
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
                      className="px-6 py-3 border cursor-pointer border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                  </div>
                </form>
              </motion.div>

              {/* Mensaje de advertencia (ej: ingredientes insuficientes) */}
              <AnimatePresence>
                {warningMessage && (
                  <motion.div
                    className="mt-4 md:mt-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                        {warningMessage}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sección de recetas generadas */}
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
                        className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 md:mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Recetas sugeridas
                      </motion.h3>
                      {recipes.map((recipeItem, index) => (
                        <motion.div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ y: isMobile ? 0 : -2 }}
                        >
                          <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                            <motion.div
                              className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0"
                              whileHover={{ rotate: 5 }}
                            >
                              <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                                {recipeItem.nombre || `Receta ${index + 1}`}
                              </h4>
                              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                  {recipeItem.tiempo || "Tiempo no estimado"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 md:gap-0 mr-20">
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
                                {(recipeItem.ingredientes || []).map(
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
                                {(recipeItem.pasos || []).map(
                                  (paso: string, i: number) => (
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
                                      <span className="">{paso}</span>
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
                          className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base"
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

      {/* Toast para mensajes temporales (errores, rate limiting) */}
      {tempMessage && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${tempMessageType === 'error'
            ? 'bg-red-500 text-white dark:bg-red-600'
            : 'bg-green-500 text-white dark:bg-green-600'
          }`}>
          {tempMessage}
        </div>
      )}

      <Footer />
    </main>
  );
}