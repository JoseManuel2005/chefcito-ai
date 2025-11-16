import { useState } from 'react';

/**
 * Hook personalizado para procesamiento de imágenes
 * 
 * Proporciona funcionalidades para:
 * - OCR: Detectar ingredientes desde imágenes de recetas/despensas
 * - Generación de imágenes: Crear visualizaciones de platos terminados
 * - Manejo de estados de carga y resultados
 * 
 * @example
 * ```tsx
 * const imageProcessing = useImageProcessing();
 * 
 * // Procesar imagen con OCR
 * await imageProcessing.processOCRText(rawText, preferences, onError);
 * 
 * // Generar imagen de un plato
 * await imageProcessing.generateDishImage(id, name, ingredients, onError);
 * ```
 */
export const useImageProcessing = () => {
  /** Ingredientes detectados desde la imagen (OCR) */
  const [ingredientsFromImage, setIngredientsFromImage] = useState<string[]>([]);
  /** Muestra/oculta chips editables de ingredientes detectados */
  const [showImageChips, setShowImageChips] = useState(false);
  /** Imágenes generadas de platos (key: recipeId, value: base64) */
  const [dishImages, setDishImages] = useState<Record<string, string>>({});
  /** Control de visibilidad de imágenes de platos */
  const [showDishImage, setShowDishImage] = useState<Record<string, boolean>>({});
  /** Estados de carga para cada imagen de plato */
  const [loadingDishImage, setLoadingDishImage] = useState<Record<string, boolean>>({});

  /**
   * Procesa texto OCR crudo y extrae ingredientes limpios usando OpenAI
   * Envía el texto a /api/clean-ingredients para obtener una lista estructurada
   * 
   * @param rawText - Texto crudo extraído de la imagen
   * @param userPreferences - Preferencias del usuario para contexto
   * @param onError - Callback para mostrar errores
   */
  const processOCRText = async (
    rawText: string,
    userPreferences: any,
    onError: (msg: string) => void
  ) => {
    try {
      const res = await fetch('/api/clean-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawText, 
          userPreferences: userPreferences
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al limpiar ingredientes');
      }

      if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        onError('No se detectaron ingredientes válidos en la imagen.');
        return;
      }

      setIngredientsFromImage(data.ingredients);
      setShowImageChips(true);
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'No se pudo procesar la imagen correctamente.');
    }
  };

  const cancelImageIngredients = () => {
    setShowImageChips(false);
    setIngredientsFromImage([]);
  };

  /**
   * Genera una imagen visual del plato terminado usando IA (Imagen 3)
   * Si la imagen ya existe, alterna su visibilidad
   * 
   * @param recipeId - ID único de la receta
   * @param recipeName - Nombre del plato a generar
   * @param ingredients - Lista de ingredientes para contexto
   * @param onError - Callback para mostrar errores
   */
  const generateDishImage = async (
    recipeId: string,
    recipeName: string,
    ingredients: string[],
    onError: (msg: string) => void
  ) => {
    if (dishImages[recipeId]) {
      setShowDishImage(prev => ({ ...prev, [recipeId]: !prev[recipeId] }));
      return;
    }

    setLoadingDishImage(prev => ({ ...prev, [recipeId]: true }));
    try {
      const res = await fetch('/api/generate-dish-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipeName || '',
          ingredients: ingredients || [],
        }),
      });
      const data = await res.json();
      if (res.ok && data.imageBase64) {
        setDishImages(prev => ({ ...prev, [recipeId]: data.imageBase64 }));
        setShowDishImage(prev => ({ ...prev, [recipeId]: true }));
      } else {
        onError('No se pudo generar la imagen del plato.');
      }
    } catch (err) {
      onError('Error al generar la imagen.');
    } finally {
      setLoadingDishImage(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const resetImages = () => {
    setDishImages({});
    setShowDishImage({});
    setLoadingDishImage({});
    setIngredientsFromImage([]);
    setShowImageChips(false);
  };

  return {
    ingredientsFromImage,
    setIngredientsFromImage,
    showImageChips,
    processOCRText,
    cancelImageIngredients,
    dishImages,
    showDishImage,
    loadingDishImage,
    generateDishImage,
    resetImages,
  };
};
