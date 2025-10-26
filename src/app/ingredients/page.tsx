// app/ingredients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from '@/components/VoiceRecorder/VoiceRecorder';
import {
  Utensils,
  Plus,
  Trash2,
  ChefHat,
  Search,
  Clock,
  AlertTriangle,
  Volume2,
  Pause,
  Heart,
  Share2,
  Copy,
  MoreHorizontal,
  Image as ImageIcon
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useTTS } from '@/hooks/useTTS';
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import * as htmlToImage from "html-to-image";
import ShareCard from "@/components/ShareCard";

/**
 * Helpers de compartir/copiar (formato legible)
 */
function formatRecipeForText(r: any, index: number) {
  const title = r?.nombre || `Receta ${index + 1}`;
  const time = r?.tiempo ? `⏱ ${r.tiempo}\n` : "";
  const ingredientes = (r?.ingredientes || [])
    .map((i: string) => `• ${i}`)
    .join("\n");
  const pasos = (r?.pasos || [])
    .map((p: string, i: number) => `${i + 1}. ${p}`)
    .join("\n");

  // Para WhatsApp / texto: negritas con *...*, saltos con \n
  return `*${title}*\n${time}\n*Ingredientes:*\n${ingredientes}\n\n*Preparación:*\n${pasos}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

// Abre WhatsApp Desktop si existe; si no, cae a WhatsApp Web
function shareViaWhatsAppDesktopOrWeb(text: string) {
  const encoded = encodeURIComponent(text);

  try {
    window.open(`whatsapp://send?text=${encoded}`, "_blank");
  } catch { /* noop */ }

  // Fallback a Web si no se pudo abrir Desktop o si el navegador bloquea popups
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    }
  }, 900);
}

async function shareSmart(text: string, title: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  shareViaWhatsAppDesktopOrWeb(text);
  return true;
}

// Crea una imagen PNG desde el componente oculto de la tarjeta
async function renderShareCardPNG(el: HTMLElement): Promise<Blob> {
  const dataUrl = await htmlToImage.toPng(el, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
    quality: 1,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}

function supportsFileShare() {
  // Android Chrome soporta Web Share Level 2; iOS va mejorando
  return !!(navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.png", { type: "image/png" })] }));
}

/**
 * Página principal para "Ingredientes → Recetas"
 */
export default function IngredientsPage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();

  const [ingredients, setIngredients] = useState<{ name: string; expiry?: string | null }[]>([{ name: "" }]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [tempMessageType, setTempMessageType] = useState<'error' | 'success'>('error');
  const [voiceTranscription, setVoiceTranscription] = useState<string>("");
  const [isVoiceFieldActive, setIsVoiceFieldActive] = useState(false);
  const tts = useTTS();
  const [currentTTSIndex, setCurrentTTSIndex] = useState<number | null>(null);

  // Menú compacto: qué tarjeta tiene el menú abierto
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    if (openMenuIndex === null) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(`menu-${openMenuIndex}`);
      if (!el) return setOpenMenuIndex(null);
      const target = e.target as Node;
      if (!el.contains(target)) setOpenMenuIndex(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuIndex]);

  // Favoritos persistidos en Firestore
  const { toggleFavorite: toggleFavoriteDb, isFavorite } = useFavoriteRecipes();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1150);
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
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSearchRecipes = async (e: React.FormEvent) => {
    tts.stop();
    setCurrentTTSIndex(null);

    e.preventDefault();

    const manualIngredients = ingredients
      .filter(ing => ing.name.trim() !== "")
      .map(ing => ({ name: ing.name.trim(), expiry: ing.expiry ?? null }));

    let voiceIngredients: { name: string; expiry: null }[] = [];
    if (voiceTranscription.trim() !== "") {
      voiceIngredients = voiceTranscription
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing !== "")
        .map(name => ({ name, expiry: null }));
    }

    const allIngredientNames = new Set<string>();
    const combinedIngredients: { name: string; expiry: string | null }[] = [];

    for (const ing of manualIngredients) {
      const key = ing.name.toLowerCase();
      if (!allIngredientNames.has(key)) {
        allIngredientNames.add(key);
        combinedIngredients.push(ing);
      }
    }
    for (const ing of voiceIngredients) {
      const key = ing.name.toLowerCase();
      if (!allIngredientNames.has(key)) {
        allIngredientNames.add(key);
        combinedIngredients.push(ing);
      }
    }

    if (combinedIngredients.length === 0) return;

    setLoading(true);
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(true);

    try {
      const payload = {
        ingredients: combinedIngredients,
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
        setTempMessage(errorData.error || "Demasiadas solicitudes. Por favor, espera 1 minuto.");
        setTempMessageType('error');
        setTimeout(() => setTempMessage(null), 5000);
        return;
      }

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();
      setRecipes(data.recipes || []);
      if (data.warning) setWarningMessage(data.warning);
    } catch (error) {
      console.error("Error:", error);
      setTempMessage("Hubo un error al generar las recetas. Por favor, intenta de nuevo.");
      setTempMessageType('error');
      setTimeout(() => setTempMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIngredients([{ name: "" }]);
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(false);
    setVoiceTranscription("");
    setIsVoiceFieldActive(false);
    tts.stop();
    setCurrentTTSIndex(null);
  };

  const scrollToRecipes = () => {
    if (isMobile && recipes.length > 0) {
      setTimeout(() => {
        document.getElementById("recipes-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  useEffect(() => {
    if (isMobile && recipes.length > 0 && !loading) {
      scrollToRecipes();
    }
  }, [recipes, loading, isMobile]);

  const mobileRecipeVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };
  const desktopRecipeVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
  };

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
        <div className={`${hasSearched && !isMobile ? "max-w-380" : "max-w-4xl"} mx-auto transition-all duration-300 pt-0 md:pt-2`}>
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
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ingredientes → Recetas</h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Genera recetas con tus ingredientes disponibles</p>
              </div>
            </div>
          </motion.div>

          <div
            className={`${isMobile ? "flex flex-col space-y-6" : hasSearched ? "flex flex-row gap-20 items-start" : "flex flex-col items-center"}`}
          >
            <motion.div
              layout
              className={`${isMobile ? "w-full" : hasSearched ? "w-1/2 sticky top-6" : "w-full"}`}
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
                <form onSubmit={handleSearchRecipes} className="space-y-4 md:space-y-6">
                  <div className="space-y-3">
                    {ingredients.map((ingredient, index) => {
                      const daysUntil = getDaysUntilExpiry(ingredient.expiry ?? null);
                      const isExpiringSoon = daysUntil !== null && daysUntil <= 2;
                      const isExpired = daysUntil !== null && daysUntil < 0;

                      return (
                        <motion.div key={index} className="flex flex-col gap-3" variants={itemVariants} layout>
                          <div className="flex flex-col sm:flex-row gap-3 items-start">
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) => handleChangeIngredientName(e.target.value, index)}
                              className="flex-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                              placeholder="Ej: tomate, cebolla, pollo..."
                            />

                            <div className="flex flex-col sm:flex-row items-start gap-2 w-full sm:w-auto">
                              <div className="relative w-full sm:w-auto min-w-[180px]">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <input
                                  type="date"
                                  value={ingredient.expiry || ""}
                                  onChange={(e) => handleChangeIngredientExpiry(e.target.value, index)}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base cursor-pointer"
                                  aria-label="Fecha de vencimiento (opcional)"
                                />
                              </div>

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
                                      {isExpired ? "Vencido" : `Vence en ${daysUntil} días`}
                                    </motion.span>
                                  )}
                                </AnimatePresence>

                                {ingredients.length > 1 && (
                                  <motion.button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(index)}
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

                  {isVoiceFieldActive ? (
                    <div className="pt-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={voiceTranscription}
                          onChange={(e) => setVoiceTranscription(e.target.value)}
                          placeholder="Edita la transcripción si es necesario..."
                          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-black dark:text-white dark:bg-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                          aria-label="Transcripción de voz (editable)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceTranscription("");
                            setIsVoiceFieldActive(false);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label="Cerrar campo de voz"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Este campo solo aparece tras usar el micrófono. Edita si la transcripción no es precisa.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-sm cursor-not-allowed">
                        Habla tus ingredientes usando el micrófono
                      </div>
                      <VoiceRecorder
                        onTranscriptionReady={(text) => {
                          const cleanText = text.trim();
                          setVoiceTranscription(cleanText);
                          if (cleanText !== "") setIsVoiceFieldActive(true);
                        }}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      type="submit"
                      disabled={
                        loading ||
                        (ingredients.every((ing) => ing.name.trim() === "") && voiceTranscription.trim() === "") ||
                        isLoading
                      }
                      className="flex-1 dark:text-gray-800 cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      whileHover={{
                        scale:
                          loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                            ? 1
                            : 1.02,
                        boxShadow:
                          loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                            ? "none"
                            : "0 4px 12px rgba(251, 191, 36, 0.3)",
                      }}
                      whileTap={{
                        scale:
                          loading || ingredients.every((ing) => ing.name.trim() === "") || isLoading
                            ? 1
                            : 0.98,
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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

            <AnimatePresence mode="popLayout">
              {(hasSearched || recipes.length > 0) && (
                <motion.div
                  key="recipes-section"
                  id="recipes-section"
                  className={`${isMobile ? "w-full" : "w-1/2 -mt-17"}`}
                  variants={isMobile ? mobileRecipeVariants : desktopRecipeVariants}
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

                      {recipes.map((recipeItem, index) => {
                        const ttsText = `
                          Receta: ${recipeItem.nombre || 'Sin nombre'}.
                          Ingredientes: ${recipeItem.ingredientes?.join(', ') || 'No especificados'}.
                          Preparación: ${recipeItem.pasos?.map((p: string, i: number) => `${i + 1}. ${p}`).join(' ') || 'No especificada'}.
                        `.replace(/\s+/g, ' ').trim();
                        const nombreReceta = recipeItem.nombre || `Receta ${index + 1}`;
                        const isFav = isFavorite(nombreReceta);

                        const shareText = formatRecipeForText(recipeItem, index);

                        const doShare = async () => {
                          const ok = await shareSmart(shareText, nombreReceta);
                          if (ok) {
                            setTempMessage("Hoja de compartir abierta");
                            setTempMessageType("success");
                            setTimeout(() => setTempMessage(null), 1800);
                          }
                        };

                        const doCopy = async () => {
                          const ok = await copyToClipboard(shareText);
                          setTempMessage(ok ? "Receta copiada" : "No se pudo copiar");
                          setTempMessageType(ok ? "success" : "error");
                          setTimeout(() => setTempMessage(null), 1800);
                        };

                        return (
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
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                                    {nombreReceta}
                                  </h4>

                                  {/* Botonera: Audio / Menú / Favorito */}
                                  <div className="flex items-center gap-1">
                                                                        {/* MENÚ COMPACTO (Share/Copy/Image) */}
                                    <div className="relative" id={`menu-${index}`}>
                                      <motion.button
                                        type="button"
                                        onClick={() => setOpenMenuIndex((v) => v === index ? null : index)}
                                        className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label="Más opciones"
                                        title="Compartir / Copiar"
                                      >
                                        <MoreHorizontal className="w-5 h-5" />
                                      </motion.button>

                                      {openMenuIndex === index && (
                                        <div className="absolute z-50 right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                                          <div className="p-2">
                                            <button
                                              type="button"
                                              onClick={async () => { setOpenMenuIndex(null); await doShare(); }}
                                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                            >
                                              <Share2 className="w-4 h-4" />
                                              Compartir
                                            </button>

                                            <button
                                              type="button"
                                              onClick={async () => { setOpenMenuIndex(null); await doCopy(); }}
                                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                            >
                                              <Copy className="w-4 h-4" />
                                              Copiar receta
                                            </button>

                                            <button
                                              type="button"
                                              onClick={async () => {
                                                setOpenMenuIndex(null);
                                                const mount = document.createElement("div");
                                                mount.style.position = "fixed";
                                                mount.style.left = "-99999px";
                                                document.body.appendChild(mount);

                                                const ingredients = (recipeItem.ingredientes || []) as string[];
                                                const steps = (recipeItem.pasos || []) as string[];

                                                const { createRoot } = await import("react-dom/client");
                                                const root = createRoot(mount);
                                                root.render(
                                                  <ShareCard
                                                    title={nombreReceta}
                                                    time={recipeItem.tiempo || ""}
                                                    ingredients={ingredients}
                                                    steps={steps}
                                                  />
                                                );
                                                await new Promise((r) => setTimeout(r, 50));
                                                const cardEl = mount.querySelector("#share-card") as HTMLElement;

                                                try {
                                                  const blob = await renderShareCardPNG(cardEl);
                                                  const file = new File([blob], `${nombreReceta}.png`, { type: "image/png" });
                                                  const caption = `Chefcito AI — ${nombreReceta}`;
                                                  if (supportsFileShare()) {
                                                    await navigator.share({ files: [file], text: caption, title: nombreReceta });
                                                    setTempMessage("Compartiendo imagen…");
                                                    setTempMessageType("success");
                                                  } else {
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = `${nombreReceta}.png`;
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                    setTempMessage("Imagen descargada. ¡Lista para compartir!");
                                                    setTempMessageType("success");
                                                  }
                                                } catch (e) {
                                                  console.error(e);
                                                  setTempMessage("No pude generar la imagen");
                                                  setTempMessageType("error");
                                                } finally {
                                                  root.unmount();
                                                  document.body.removeChild(mount);
                                                  setTimeout(() => setTempMessage(null), 2500);
                                                }
                                              }}
                                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                            >
                                              <ImageIcon className="w-4 h-4" />
                                              Compartir como imagen 
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Audio TTS */}
                                    <motion.button
                                      type="button"
                                      onClick={() => {
                                        if (currentTTSIndex === index) {
                                          if (tts.status === "playing") tts.pause();
                                          else if (tts.status === "paused") tts.resume();
                                        } else {
                                          tts.stop();
                                          setCurrentTTSIndex(index);
                                          tts.speak(ttsText);
                                        }
                                      }}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      aria-label={currentTTSIndex === index && tts.status === "playing" ? "Pausar lectura" : "Leer receta en voz alta"}
                                    >
                                      {currentTTSIndex === index && tts.status === "loading" ? (
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                      ) : currentTTSIndex === index && tts.status === "playing" ? (
                                        <Pause className="w-5 h-5" />
                                      ) : (
                                        <Volume2 className="w-5 h-5" />
                                      )}
                                    </motion.button>

                                    {/* Favorito */}
                                    <motion.button
                                      type="button"
                                      onClick={async () => {
                                        const data = {
                                          nombre: nombreReceta,
                                          ingredientes: (recipeItem.ingredientes || []) as string[],
                                          pasos: (recipeItem.pasos || []) as string[],
                                          tiempo: (recipeItem.tiempo || "") as string,
                                        };
                                        const wasFav = isFav;
                                        const ok = await toggleFavoriteDb(data);
                                        if (!ok) {
                                          setTempMessage("Inicia sesión para guardar favoritos");
                                          setTempMessageType('error');
                                          setTimeout(() => setTempMessage(null), 4000);
                                          return;
                                        }
                                        setTempMessage(wasFav ? "Eliminado de favoritos" : "Agregado a favoritos");
                                        setTempMessageType('success');
                                        setTimeout(() => setTempMessage(null), 2500);
                                      }}
                                      className={`p-1.5 rounded-full transition-colors cursor-pointer group ${isFav ? "hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"}`}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                                    >
                                      <Heart
                                        className={`w-5 h-5 transition-colors ${
                                          isFav
                                            ? "text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400"
                                            : "text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                                        }`}
                                      />
                                    </motion.button>
                                  </div>
                                </div>

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
                                  {(recipeItem.ingredientes || []).map((ing: string, i: number) => (
                                    <motion.li
                                      key={i}
                                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                                    >
                                      <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                                      {ing}
                                    </motion.li>
                                  ))}
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
                                  {(recipeItem.pasos || []).map((paso: string, i: number) => (
                                    <motion.li
                                      key={i}
                                      className="flex gap-2 md:gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.6 + index * 0.1 + i * 0.05 }}
                                    >
                                      <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="">{paso}</span>
                                    </motion.li>
                                  ))}
                                </ol>
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : loading ? (
                    <motion.div className="flex items-center justify-center py-8 md:py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-center">
                        <motion.div
                          className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#FFCB2B] rounded-full mb-3 md:mb-4"
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                        >
                          <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </motion.div>
                        <motion.p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
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

      {tempMessage && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${tempMessageType === 'error' ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-green-500 text-white dark:bg-green-600'}`}
        >
          {tempMessage}
        </div>
      )}

      <Footer />
    </main>
  );
}
