import { useState } from 'react';

/**
 * Interfaz que define la estructura de un ingrediente
 */
export interface Ingredient {
  /** Nombre del ingrediente (ej: "tomate", "pollo") */
  name: string;
  /** Fecha de vencimiento en formato ISO (opcional) */
  expiry?: string | null;
}

/**
 * Hook personalizado para gestionar la lista de ingredientes
 * 
 * Proporciona funcionalidades para:
 * - Agregar, editar y eliminar ingredientes
 * - Validar y obtener ingredientes válidos
 * - Calcular días hasta el vencimiento
 * - Agregar ingredientes desde listas externas (OCR, voz)
 * 
 * @example
 * ```tsx
 * const ingredients = useIngredients();
 * 
 * // Agregar ingrediente
 * ingredients.addIngredient();
 * 
 * // Actualizar nombre
 * ingredients.updateIngredientName("tomate", 0);
 * 
 * // Obtener solo ingredientes válidos
 * const valid = ingredients.getValidIngredients();
 * ```
 */
export const useIngredients = () => {
  // Estado: lista de ingredientes (comienza con un ingrediente vacío)
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "" }]);

  /**
   * Agrega un nuevo ingrediente vacío a la lista
   */
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", expiry: null }]);
  };

  /**
   * Actualiza el nombre de un ingrediente específico
   * @param value - Nuevo nombre del ingrediente
   * @param index - Posición del ingrediente en la lista
   */
  const updateIngredientName = (value: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], name: value };
    setIngredients(updated);
  };

  /**
   * Actualiza la fecha de vencimiento de un ingrediente
   * @param value - Nueva fecha en formato ISO
   * @param index - Posición del ingrediente en la lista
   */
  const updateIngredientExpiry = (value: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], expiry: value || null };
    setIngredients(updated);
  };

  /**
   * Elimina un ingrediente de la lista
   * Mantiene al menos un ingrediente en la lista
   * @param index - Posición del ingrediente a eliminar
   */
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const resetIngredients = () => {
    setIngredients([{ name: "" }]);
  };

  /**
   * Agrega múltiples ingredientes desde una lista de strings
   * Útil para agregar ingredientes detectados por OCR o voz
   * Si solo hay un ingrediente vacío, lo reemplaza; sino, agrega al final
   * @param newIngredients - Array de nombres de ingredientes
   */
  const addIngredientsFromList = (newIngredients: string[]) => {
    const ingredientsToAdd = newIngredients.map(name => ({ name, expiry: null }));

    setIngredients(prev => {
      const isFirstEmpty = prev.length === 1 && prev[0].name.trim() === "";
      if (isFirstEmpty && ingredientsToAdd.length > 0) {
        const [firstFromImage, ...restFromImage] = ingredientsToAdd;
        return [firstFromImage, ...restFromImage];
      } else {
        return [...prev, ...ingredientsToAdd];
      }
    });
  };

  /**
   * Calcula cuántos días faltan hasta que venza un ingrediente
   * @param expiryDate - Fecha de vencimiento en formato ISO
   * @returns Número de días (negativo si ya venció) o null si no hay fecha
   */
  const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getValidIngredients = () => {
    return ingredients
      .filter(ing => ing.name.trim() !== "")
      .map(ing => ({ name: ing.name.trim(), expiry: ing.expiry ?? null }));
  };

  return {
    ingredients,
    addIngredient,
    updateIngredientName,
    updateIngredientExpiry,
    removeIngredient,
    resetIngredients,
    addIngredientsFromList,
    getDaysUntilExpiry,
    getValidIngredients,
  };
};
