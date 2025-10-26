// app/favorites/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUserData } from "@/hooks/useUserData";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import {
  Heart,
  ChefHat,
  Clock,
  Trash2,
  Share2,
  Copy,
  MoreHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import ShareCard from "@/components/ShareCard";

function formatRecipeForText(r: any, index?: number) {
  const title = r?.nombre || (typeof index === "number" ? `Receta ${index + 1}` : "Receta");
  const time = r?.tiempo ? `⏱ ${r.tiempo}\n` : "";
  const ingredientes = (r?.ingredientes || []).map((i: string) => `• ${i}`).join("\n");
  const pasos = (r?.pasos || []).map((p: string, i: number) => `${i + 1}. ${p}`).join("\n");
  return `*${title}*\n${time}\n*Ingredientes:*\n${ingredientes || "• —"}\n\n*Preparación:*\n${pasos || "—"}`;
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

function shareViaWhatsAppDesktopOrWeb(text: string) {
  const encoded = encodeURIComponent(text);
  try {
    window.open(`whatsapp://send?text=${encoded}`, "_blank");
  } catch { /* noop */ }
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

// Generación PNG desde ShareCard oculto
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
  return !!(navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.png", { type: "image/png" })] }));
}

export default function FavoritesPage() {
  const { userPhoto } = useUserData();
  const { favorites, isLoadingFavorites, toggleFavorite } = useFavoriteRecipes();

  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [tempMessageType, setTempMessageType] = useState<"error" | "success">("success");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const favoritesList = useMemo(() => Array.from(favorites.values()), [favorites]);

  // Cerrar menú en click fuera
  useEffect(() => {
    if (openMenuIndex === null) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(`fav-menu-${openMenuIndex}`);
      if (!el) return setOpenMenuIndex(null);
      if (!el.contains(e.target as Node)) setOpenMenuIndex(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuIndex]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar userPhoto={userPhoto} />

      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto pt-0 md:pt-2">
          {/* Header */}
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
                <Heart className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Recetas Favoritas
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Tu colección personal de recetas
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoadingFavorites ? (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <ChefHat className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400">Cargando tus favoritos...</p>
                </div>
              </motion.div>
            ) : favoritesList.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Aún no tienes favoritos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Marca recetas con el corazón para guardarlas aquí y poder consultarlas cuando quieras.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="space-y-4 md:space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favoritesList.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-8 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
                    variants={itemVariants}
                  >
                    <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                            {recipe.nombre || `Receta ${index + 1}`}
                          </h4>

                          {/* Botones de compartir */}
                          <div className="flex items-center gap-1">
                            {/* Menú compacto (compartir) */}
                            <div className="relative" id={`fav-menu-${index}`}>
                              <motion.button
                                type="button"
                                onClick={() => setOpenMenuIndex((v) => (v === index ? null : index))}
                                className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Más opciones"
                                title="Compartir / Copiar"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </motion.button>

                              {openMenuIndex === index && (
                                <div className="absolute z-50 right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                                  <div className="p-2">
                                    {/* Compartir texto */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setOpenMenuIndex(null);
                                        const shareText = formatRecipeForText(recipe, index);
                                        const ok = await shareSmart(shareText, recipe.nombre || `Receta ${index + 1}`);
                                        if (ok) {
                                          setTempMessage("Hoja de compartir abierta");
                                          setTempMessageType("success");
                                          setTimeout(() => setTempMessage(null), 1800);
                                        }
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                    >
                                      <Share2 className="w-4 h-4" />
                                      Compartir
                                    </button>

                                    {/* Copiar texto */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setOpenMenuIndex(null);
                                        const shareText = formatRecipeForText(recipe, index);
                                        const ok = await copyToClipboard(shareText);
                                        setTempMessage(ok ? "Receta copiada" : "No se pudo copiar");
                                        setTempMessageType(ok ? "success" : "error");
                                        setTimeout(() => setTempMessage(null), 1800);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                    >
                                      <Copy className="w-4 h-4" />
                                      Copiar receta
                                    </button>

                                    {/* Compartir como imagen */}
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setOpenMenuIndex(null);

                                        // Montamos ShareCard temporalmente
                                        const mount = document.createElement("div");
                                        mount.style.position = "fixed";
                                        mount.style.left = "-99999px";
                                        document.body.appendChild(mount);

                                        const ingredients = (recipe.ingredientes || []) as string[];
                                        const steps = (recipe.pasos || []) as string[];

                                        const { createRoot } = await import("react-dom/client");
                                        const root = createRoot(mount);
                                        root.render(
                                          <ShareCard
                                            title={recipe.nombre || `Receta ${index + 1}`}
                                            time={recipe.tiempo || ""}
                                            ingredients={ingredients}
                                            steps={steps}
                                          />
                                        );
                                        await new Promise((r) => setTimeout(r, 50));
                                        const cardEl = mount.querySelector("#share-card") as HTMLElement;

                                        try {
                                          const blob = await renderShareCardPNG(cardEl);
                                          const file = new File([blob], `${recipe.nombre || `receta-${index + 1}`}.png`, { type: "image/png" });
                                          const caption = `Chefcito AI — ${recipe.nombre || `Receta ${index + 1}`}`;
                                          if (supportsFileShare()) {
                                            await navigator.share({ files: [file], text: caption, title: recipe.nombre || `Receta ${index + 1}` });
                                            setTempMessage("Compartiendo imagen…");
                                            setTempMessageType("success");
                                          } else {
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a");
                                            a.href = url;
                                            a.download = `${recipe.nombre || `receta-${index + 1}`}.png`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            setTempMessage("Imagen descargada. ¡Lista para compartir!");
                                            setTempMessageType("success");
                                          }
                                        } catch (e) {
                                          console.error(e);
                                          setTempMessage("No se pudo generar la imagen");
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

                            {/* Quitar de favoritos (intacto) */}
                            <motion.button
                              type="button"
                              onClick={async () => {
                                const ok = await toggleFavorite({
                                  nombre: recipe.nombre,
                                  ingredientes: recipe.ingredientes,
                                  pasos: recipe.pasos,
                                  tiempo: recipe.tiempo,
                                });
                                if (ok) {
                                  setTempMessage("Eliminado de favoritos");
                                  setTempMessageType("success");
                                } else {
                                  setTempMessage("No se pudo actualizar el favorito");
                                  setTempMessageType("error");
                                }
                                setTimeout(() => setTempMessage(null), 2500);
                              }}
                              className="p-1.5 rounded-full transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Quitar de favoritos"
                            >
                              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </motion.button>
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

                    <div className="grid md:grid-cols-3 gap-4 md:gap-0 mr-20">
                      <div className="col-span-1">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                          Ingredientes:
                        </h5>
                        <ul className="space-y-1 md:space-y-2">
                          {(recipe.ingredientes || []).map((ing: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                              <div className="w-1.5 h-1.5 bg-yellow-400 dark:bg-yellow-500 rounded-full shrink-0" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-span-2 md:ml-5">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 text-sm md:text-base">
                          Preparación:
                        </h5>
                        <ol className="space-y-1 md:space-y-2">
                          {(recipe.pasos || []).map((paso: string, i: number) => (
                            <li key={i} className="flex gap-2 md:gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                              <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs md:text-sm font-medium rounded-full shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{paso}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tempMessage && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
            tempMessageType === "error"
              ? "bg-red-500 text-white dark:bg-red-600"
              : "bg-green-500 text-white dark:bg-green-600"
          }`}
        >
          {tempMessage}
        </div>
      )}

      <Footer />
    </main>
  );
}
