import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chefcito_recipes';

export interface Recipe {
  nombre: string;
  ingredientes: string[];
  pasos: string[];
  tiempo: string;
}

/**
 * Hook para persistir recetas en localStorage durante la sesión
 * Restaura automáticamente las recetas al cargar la página
 */
export function useLocalRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isRestored, setIsRestored] = useState(false);

  // Restaurar recetas del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecipes(parsed);
      }
    } catch (error) {
      console.error('Error restoring recipes from localStorage:', error);
    } finally {
      setIsRestored(true);
    }
  }, []);

  // Guardar recetas en localStorage cada vez que cambien
  useEffect(() => {
    if (!isRestored) return; // No guardar hasta que se haya restaurado
    
    try {
      if (recipes.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving recipes to localStorage:', error);
    }
  }, [recipes, isRestored]);

  const saveRecipes = (newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
  };

  const clearRecipes = () => {
    setRecipes([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    recipes,
    saveRecipes,
    clearRecipes,
    isRestored,
  };
}
