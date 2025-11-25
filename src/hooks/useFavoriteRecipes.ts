// hooks/useFavoriteRecipes.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
} from "firebase/firestore";

export interface FavoriteRecipe {
  id: string;
  nombre: string;
  ingredientes: string[];
  pasos: string[];
  tiempo: string;
  createdAt: string;
}

export interface UseFavoriteRecipesReturn {
  favorites: Map<string, FavoriteRecipe>;
  isLoadingFavorites: boolean;
  addFavorite: (recipe: Omit<FavoriteRecipe, 'id' | 'createdAt'>) => Promise<boolean>;
  removeFavorite: (recipeId: string) => Promise<boolean>;
  toggleFavorite: (recipe: Omit<FavoriteRecipe, 'id' | 'createdAt'>) => Promise<boolean>;
  isFavorite: (recipeName: string, ingredientes?: string[]) => boolean;
  refreshFavorites: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar recetas favoritas del usuario
 * Sincroniza con Firebase Firestore y mantiene estado local
 */
export function useFavoriteRecipes(): UseFavoriteRecipesReturn {
  const [favorites, setFavorites] = useState<Map<string, FavoriteRecipe>>(new Map());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  /**
   * Genera un ID único para una receta basado en su nombre
   * Limpia el nombre y agrega timestamp para evitar duplicados
   */
  const generateRecipeId = (recipeName: string): string => {
    const cleanName = recipeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${cleanName}-${Date.now()}`;
  };

  /**
   * Carga los favoritos desde Firestore al montar el componente
   */
  const loadFavorites = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoadingFavorites(false);
      return;
    }

    try {
      const favoritesRef = collection(db, "users", user.uid, "favoriteRecipes");
      const snapshot = await getDocs(favoritesRef);
      const favoritesMap = new Map<string, FavoriteRecipe>();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        favoritesMap.set(doc.id, {
          id: doc.id,
          nombre: data.nombre || '',
          ingredientes: data.ingredientes || [],
          pasos: data.pasos || [],
          tiempo: data.tiempo || '',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      
      setFavorites(favoritesMap);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, []);

  /**
   * Refresca manualmente los favoritos desde Firestore
   */
  const refreshFavorites = useCallback(async () => {
    setIsLoadingFavorites(true);
    await loadFavorites();
  }, [loadFavorites]);

  /**
   * Carga favoritos al montar y cuando cambie el usuario
   */
  useEffect(() => {
    loadFavorites();

    // Escuchar cambios en la autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadFavorites();
      } else {
        setFavorites(new Map());
        setIsLoadingFavorites(false);
      }
    });

    return () => unsubscribe();
  }, [loadFavorites]);

  /**
   * Agrega una receta a favoritos en Firestore y estado local
   */
  const addFavorite = useCallback(async (
    recipe: Omit<FavoriteRecipe, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuario no autenticado");
      return false;
    }

    try {
      const recipeId = generateRecipeId(recipe.nombre);
      const recipeData = {
        nombre: recipe.nombre,
        ingredientes: recipe.ingredientes,
        pasos: recipe.pasos,
        tiempo: recipe.tiempo,
        createdAt: new Date().toISOString(),
      };

      const favoriteRef = doc(db, "users", user.uid, "favoriteRecipes", recipeId);
      await setDoc(favoriteRef, recipeData);

      // Actualizar estado local
      setFavorites((prev) => {
        const newFavorites = new Map(prev);
        newFavorites.set(recipeId, {
          id: recipeId,
          ...recipeData,
        });
        return newFavorites;
      });

      return true;
    } catch (error) {
      console.error("Error al agregar favorito:", error);
      return false;
    }
  }, []);

  /**
   * Elimina una receta de favoritos por su ID
   */
  const removeFavorite = useCallback(async (recipeId: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuario no autenticado");
      return false;
    }

    try {
      const favoriteRef = doc(db, "users", user.uid, "favoriteRecipes", recipeId);
      await deleteDoc(favoriteRef);

      // Actualizar estado local
      setFavorites((prev) => {
        const newFavorites = new Map(prev);
        newFavorites.delete(recipeId);
        return newFavorites;
      });

      return true;
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      return false;
    }
  }, []);

  /**
   * Alterna el estado de favorito de una receta
   * Si existe una receta idéntica (nombre + ingredientes), no hace nada y retorna true
   * Si no existe, la agrega permitiendo múltiples versiones con nombres iguales pero ingredientes diferentes
   */
  const toggleFavorite = useCallback(async (
    recipe: Omit<FavoriteRecipe, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    // Verificar si ya existe esta receta específica (nombre + ingredientes)
    const normalizeIngredient = (ing: string) => ing.toLowerCase().trim();
    const normalizedSearchIngredients = recipe.ingredientes.map(normalizeIngredient).sort();
    
    const existingFavorite = Array.from(favorites.values()).find(fav => {
      if (fav.nombre.toLowerCase() !== recipe.nombre.toLowerCase()) {
        return false;
      }
      
      const normalizedFavIngredients = fav.ingredientes.map(normalizeIngredient).sort();
      
      if (normalizedFavIngredients.length !== normalizedSearchIngredients.length) {
        return false;
      }
      
      return normalizedFavIngredients.every((ing, index) => 
        ing === normalizedSearchIngredients[index]
      );
    });

    if (existingFavorite) {
      // Si ya existe esta receta específica, la eliminamos
      return await removeFavorite(existingFavorite.id);
    }
    
    // Si no existe, la agregamos
    return await addFavorite(recipe);
  }, [favorites, addFavorite, removeFavorite]);

  /**
   * Verifica si una receta está en favoritos
   * Si se proporcionan ingredientes, compara nombre + ingredientes
   * Si no, solo compara por nombre (retorna true si existe alguna versión)
   */
  const isFavorite = useCallback((recipeName: string, ingredientes?: string[]): boolean => {
    if (!ingredientes || ingredientes.length === 0) {
      // Solo verificar por nombre
      return Array.from(favorites.values()).some(
        fav => fav.nombre.toLowerCase() === recipeName.toLowerCase()
      );
    }
    
    // Verificar por nombre + ingredientes
    const normalizeIngredient = (ing: string) => ing.toLowerCase().trim();
    const normalizedSearchIngredients = ingredientes.map(normalizeIngredient).sort();
    
    return Array.from(favorites.values()).some(fav => {
      if (fav.nombre.toLowerCase() !== recipeName.toLowerCase()) {
        return false;
      }
      
      const normalizedFavIngredients = fav.ingredientes.map(normalizeIngredient).sort();
      
      // Comparar si tienen los mismos ingredientes
      if (normalizedFavIngredients.length !== normalizedSearchIngredients.length) {
        return false;
      }
      
      return normalizedFavIngredients.every((ing, index) => 
        ing === normalizedSearchIngredients[index]
      );
    });
  }, [favorites]);

  return {
    favorites,
    isLoadingFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
  };
}