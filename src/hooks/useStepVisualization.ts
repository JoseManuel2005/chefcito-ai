// hooks/useStepVisualization.ts
import { useState, useCallback } from 'react';

export const useStepVisualization = () => {
  const [stepImages, setStepImages] = useState<Record<string, string[]>>({});
  const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});

  const generateStepImage = useCallback(async (recipeId: string, steps: string[]) => {
    if (stepImages[recipeId] || loadingSteps[recipeId]) return;

    const stepsToGenerate = steps.filter(step => step.trim() !== '');

    if (stepsToGenerate.length === 0) {
      setStepImages(prev => ({ ...prev, [recipeId]: [] }));
      return;
    }

    setLoadingSteps(prev => ({ ...prev, [recipeId]: true }));

    try {
      const images: string[] = [];

      for (const step of stepsToGenerate) {
        const res = await fetch('/api/generate-step-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepText: step }),
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