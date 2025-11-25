"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import RecipeCard from "./RecipeCard";
import { useStepVisualization } from "@/hooks/useStepVisualization";
import type { Recipe } from "@/hooks/useRecipeSearch";
import {
  formatRecipeForText,
  copyToClipboard,
  shareSmart,
  shareRecipeAsImage,
} from "@/utils/shareUtils";

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
  isMobile: boolean;
  currentTTSIndex: number | null;
  setCurrentTTSIndex: (index: number | null) => void;
  ttsStatus: string;
  ttsSpeak: (text: string) => void;
  ttsPause: () => void;
  ttsResume: () => void;
  ttsStop: () => void;
  isFavorite: (name: string, ingredientes?: string[]) => boolean;
  toggleFavorite: (recipe: any) => Promise<boolean>;
  showSuccess: (msg: string, duration?: number) => void;
  showError: (msg: string, duration?: number) => void;
  openMenuIndex: number | null;
  setOpenMenuIndex: (index: number | null) => void;
  dishImages: Record<string, string>;
  showDishImage: Record<string, boolean>;
  loadingDishImage: Record<string, boolean>;
  generateDishImage: (
    recipeId: string,
    recipeName: string,
    ingredients: string[],
    onError: (msg: string) => void
  ) => void;
}

export default function RecipeList({
  recipes,
  loading,
  isMobile,
  currentTTSIndex,
  setCurrentTTSIndex,
  ttsStatus,
  ttsSpeak,
  ttsPause,
  ttsResume,
  ttsStop,
  isFavorite,
  toggleFavorite,
  showSuccess,
  showError,
  openMenuIndex,
  setOpenMenuIndex,
  dishImages,
  showDishImage,
  loadingDishImage,
  generateDishImage,
}: RecipeListProps) {
  const { stepImages, loadingSteps, generateStepImage } = useStepVisualization();

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center py-12 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 blur-md opacity-70 animate-pulse" />
            <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-900 dark:bg-slate-900 rounded-full shadow-lg">
              <ChefHat className="w-7 h-7 md:w-8 md:h-8 text-amber-300 animate-bounce" />
            </div>
          </div>
          <motion.p
            className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Generando tus recetas...
          </motion.p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Esto puede tomar unos segundos
          </p>
        </div>
      </motion.div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <motion.div className="space-y-4 md:space-y-6">
      {recipes.map((recipeItem, index) => {
        const ttsText = `
          Receta: ${recipeItem.nombre || "Sin nombre"}.
          Ingredientes: ${
            recipeItem.ingredientes?.join(", ") || "No especificados"
          }.
          Preparación: ${
            recipeItem.pasos
              ?.map((p: string, i: number) => `${i + 1}. ${p}`)
              .join(" ") || "No especificada"
          }.
        `
          .replace(/\s+/g, " ")
          .trim();

        const nombreReceta = recipeItem.nombre || `Receta ${index + 1}`;
        const isFav = isFavorite(nombreReceta);
        const recipeId = recipeItem.id || Math.random().toString();

        return (
          <div key={recipeId}>
            <RecipeCard
              recipe={recipeItem}
              index={index}
              isMobile={isMobile}
              isFavorite={isFav}
              onToggleFavorite={async () => {
                const data = {
                  nombre: nombreReceta,
                  ingredientes: (recipeItem.ingredientes || []) as string[],
                  pasos: (recipeItem.pasos || []) as string[],
                  tiempo: (recipeItem.tiempo || "") as string,
                };
                const wasFav = isFav;
                const ok = await toggleFavorite(data);
                if (!ok) {
                  showError("Inicia sesión para guardar favoritos", 4000);
                  return;
                }
                showSuccess(
                  wasFav ? "Eliminado de favoritos" : "Agregado a favoritos"
                );
              }}
              currentTTSIndex={currentTTSIndex}
              ttsStatus={ttsStatus}
              onTTSClick={() => {
                if (currentTTSIndex === index) {
                  if (ttsStatus === "playing") ttsPause();
                  else if (ttsStatus === "paused") ttsResume();
                } else {
                  ttsStop();
                  setCurrentTTSIndex(index);
                  ttsSpeak(ttsText);
                }
              }}
              openMenuIndex={openMenuIndex}
              setOpenMenuIndex={setOpenMenuIndex}
              onShareText={async () => {
                setOpenMenuIndex(null);
                const shareText = formatRecipeForText(recipeItem, index);
                const ok = await shareSmart(shareText, nombreReceta);
                if (ok) showSuccess("Hoja de compartir abierta", 1800);
              }}
              onCopyText={async () => {
                setOpenMenuIndex(null);
                const shareText = formatRecipeForText(recipeItem, index);
                const ok = await copyToClipboard(shareText);
                ok
                  ? showSuccess("Receta copiada", 1800)
                  : showError("No se pudo copiar", 1800);
              }}
              onShareImage={async () => {
                setOpenMenuIndex(null);
                await shareRecipeAsImage(
                  recipeItem,
                  index,
                  showSuccess,
                  showError
                );
              }}
              dishImage={dishImages[recipeId]}
              showDishImage={showDishImage[recipeId] || false}
              loadingDishImage={loadingDishImage[recipeId] || false}
              onGenerateImage={() => {
                if (currentTTSIndex !== null) ttsStop();
                generateDishImage(
                  recipeId,
                  recipeItem.nombre || "",
                  recipeItem.ingredientes || [],
                  showError
                );
              }}
              // 👇 Guía visual: todo queda dentro de la card
              stepImages={stepImages[index] || []}
              loadingSteps={!!loadingSteps[index]}
              onGenerateSteps={() =>
                generateStepImage(index.toString(), recipeItem.pasos || [])
              }
            />
          </div>
        );
      })}
    </motion.div>
  );
}
