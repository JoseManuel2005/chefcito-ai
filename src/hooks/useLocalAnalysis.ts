import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chefcito_analysis';

export interface RecipeAnalysis {
  receta: string;
  ingredientes: string[];
  pasos: string[];
  tiempo: string;
  comentario?: string;
}

/**
 * Hook para persistir análisis de recetas en localStorage durante la sesión
 * Restaura automáticamente el análisis al cargar la página
 */
export function useLocalAnalysis() {
  const [analysis, setAnalysis] = useState<RecipeAnalysis | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // Restaurar análisis del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalysis(parsed);
      }
    } catch (error) {
      console.error('Error restoring analysis from localStorage:', error);
    } finally {
      setIsRestored(true);
    }
  }, []);

  // Guardar análisis en localStorage cada vez que cambie
  useEffect(() => {
    if (!isRestored) return; // No guardar hasta que se haya restaurado
    
    try {
      if (analysis) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving analysis to localStorage:', error);
    }
  }, [analysis, isRestored]);

  const saveAnalysis = (newAnalysis: RecipeAnalysis | null) => {
    setAnalysis(newAnalysis);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    analysis,
    saveAnalysis,
    clearAnalysis,
    isRestored,
  };
}
