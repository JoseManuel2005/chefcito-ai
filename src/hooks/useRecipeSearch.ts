import { useState, useEffect } from 'react';
import type { Ingredient } from './useIngredients';
import { useLocalRecipes } from './useLocalRecipes';
import type { Recipe as LocalRecipe } from './useLocalRecipes';

/**
 * Interfaz que define la estructura de una receta
 */
export interface Recipe {
  /** ID único de la receta */
  id: string;
  /** Nombre de la receta */
  nombre?: string;
  /** Lista de ingredientes necesarios */
  ingredientes?: string[];
  /** Pasos de preparación */
  pasos?: string[];
  /** Tiempo estimado de preparación */
  tiempo?: string;
  /** Campos adicionales dinámicos */
  [key: string]: any;
}

/**
 * Hook personalizado para buscar recetas basadas en ingredientes
 * 
 * Funcionalidades:
 * - Busca recetas usando ingredientes manuales y de voz
 * - Maneja estados de carga y errores
 * - Gestiona mensajes de advertencia (ingredientes próximos a vencer)
 * - Rate limiting para evitar sobrecarga del API
 * 
 * @example
 * ```tsx
 * const recipeSearch = useRecipeSearch();
 * 
 * await recipeSearch.searchRecipes(
 *   ingredients,
 *   voiceTranscription,
 *   userPreferences,
 *   showError
 * );
 * ```
 */
export const useRecipeSearch = () => {
  const localRecipes = useLocalRecipes();
  
  /** Lista de recetas encontradas */
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  /** Indica si está buscando recetas actualmente */
  const [loading, setLoading] = useState(false);
  /** Mensaje de advertencia (ej: ingredientes próximos a vencer) */
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  /** Indica si se ha realizado al menos una búsqueda */
  const [hasSearched, setHasSearched] = useState(false);

  // Restaurar recetas del localStorage cuando esté listo
  useEffect(() => {
    if (localRecipes.isRestored && localRecipes.recipes.length > 0) {
      const recipesWithId = localRecipes.recipes.map((recipe: LocalRecipe, idx: number) => ({
        ...recipe,
        id: `${recipe.nombre || 'receta'}-${Date.now()}-${idx}`
      }));
      setRecipes(recipesWithId);
      setHasSearched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRecipes.isRestored]);

  /**
   * Busca recetas combinando ingredientes manuales y de voz
   * Elimina duplicados y envía petición al API de recetas
   * 
   * @param ingredients - Lista de ingredientes con nombre y fecha de vencimiento
   * @param voiceTranscription - Ingredientes detectados por voz (separados por comas)
   * @param userPreferences - Preferencias del usuario (alergias, cocinas, país)
   * @param onError - Callback para mostrar errores al usuario
   */
  const searchRecipes = async (
    ingredients: Ingredient[],
    voiceTranscription: string,
    userPreferences: any,
    onError: (msg: string, duration?: number) => void
  ) => {
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
        onError(errorData.error || "Demasiadas solicitudes. Por favor, espera 1 minuto.", 5000);
        return;
      }

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json() as { recipes?: Recipe[]; warning?: string };
      const recipesWithId = (data.recipes || []).map((recipe: Recipe) => ({
        ...recipe,
        id: `${recipe.nombre || 'receta'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }));
      setRecipes(recipesWithId);
      
      // Guardar en localStorage (sin el campo 'id')
      const recipesToStore: LocalRecipe[] = recipesWithId.map(({ id, ...recipe }) => ({
        nombre: recipe.nombre || '',
        ingredientes: recipe.ingredientes || [],
        pasos: recipe.pasos || [],
        tiempo: recipe.tiempo || '',
      }));
      localRecipes.saveRecipes(recipesToStore);
      
      if (data.warning) setWarningMessage(data.warning);
    } catch (error) {
      console.error("Error:", error);
      onError("Hubo un error al generar las recetas. Por favor, intenta de nuevo.", 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setRecipes([]);
    setWarningMessage(null);
    setHasSearched(false);
    localRecipes.clearRecipes();
  };

  return {
    recipes,
    loading,
    warningMessage,
    hasSearched,
    searchRecipes,
    resetSearch,
  };
};
