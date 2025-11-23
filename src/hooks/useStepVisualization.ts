// hooks/useStepVisualization.ts
import { useState, useCallback } from 'react';

export const useStepVisualization = () => {
  const [stepImages, setStepImages] = useState<Record<string, string[]>>({});
  const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});

  const generateStepImage = useCallback(async (recipeId: string, steps: string[]) => {
    if (stepImages[recipeId] || loadingSteps[recipeId]) return;

    const stepsToGenerate = steps; // 👈 Usa TODOS los pasos, no solo 2

    setLoadingSteps(prev => ({ ...prev, [recipeId]: true }));

    try {
      const images: string[] = [];

      for (const step of stepsToGenerate) {
        if (!step.trim()) {
          images.push('');
          continue;
        }

		const prompt = `
		Ilustración clara y didáctica del paso: "${step}".
		- Estilo: infografía animada estilo manual de cocina, limpia y educativa.
		- Debe mostrar claramente **la acción principal** (ej. "cortar", "mezclar", "hornear") y los **ingredientes/herramientas involucrados**.
		- Fondo blanco, sin texto, sin sombras complejas.
		- Enfoque en claridad: que se entienda la acción incluso en tamaño pequeño.
		- Formato cuadrado 1:1.
		`;
		
        const res = await fetch('/api/generate-step-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        images.push(data.imageBase64 || '');
      }

      setStepImages(prev => ({ ...prev, [recipeId]: images }));
    } catch (error) {
      console.error('Error al generar imagen de paso:', error);
      setStepImages(prev => ({ ...prev, [recipeId]: Array(stepsToGenerate.length).fill('') }));
    } finally {
      setLoadingSteps(prev => ({ ...prev, [recipeId]: false }));
    }
  }, [stepImages, loadingSteps]);

  return {
    stepImages,
    loadingSteps,
    generateStepImage,
  };
};