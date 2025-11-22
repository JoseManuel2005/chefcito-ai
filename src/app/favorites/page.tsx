"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TempMessageToast from "@/components/TempMessageToast";
import ShareMenu from "@/components/ShareMenu";
import RecipeDetailModal, { Recipe } from "@/components/RecipeDetailModal";
import { useUserData } from "@/hooks/useUserData";
import { useFavoriteRecipes } from "@/hooks/useFavoriteRecipes";
import { useTempMessage } from "@/hooks/useTempMessage";
import { useMenuToggle } from "@/hooks/useMenuToggle";
import {
  formatRecipeForText,
  copyToClipboard,
  shareSmart,
  shareRecipeAsImage,
} from "@/utils/shareUtils";
import { containerVariants, itemVariants } from "@/utils/animations";
import {
  Heart,
  ChefHat,
  Clock,
  Trash2,
  Users,
  Eye,
  Share2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";

export default function FavoritesPage() {
  const { userPhoto } = useUserData();
  const { favorites, isLoadingFavorites, toggleFavorite, removeFavorite } = useFavoriteRecipes();
  const { tempMessage, tempMessageType, showError, showSuccess } = useTempMessage();
  const { openMenuIndex, setOpenMenuIndex } = useMenuToggle("fav-menu");
  
  // Estado para el modal de detalles
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  
  // Estados para selección múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  const favoritesList = useMemo(() => Array.from(favorites.values()), [favorites]);

  const openRecipeDetail = (recipe: Recipe, index: number) => {
    setSelectedRecipe(recipe);
    setSelectedRecipeIndex(index);
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
    setSelectedRecipeIndex(null);
  };

  // Funciones de selección múltiple
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(favoritesList.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const deleteSelected = async () => {
    let deletedCount = 0;
    for (const id of selectedIds) {
      const ok = await removeFavorite(id);
      if (ok) deletedCount++;
    }
    exitSelectionMode();
    setShowDeleteSelectedConfirm(false);
    if (deletedCount > 0) {
      showError(`${deletedCount} ${deletedCount === 1 ? 'receta eliminada' : 'recetas eliminadas'}`);
    } else {
      showError("No se pudieron eliminar las recetas");
    }
  };

  const deleteAll = async () => {
    let deletedCount = 0;
    for (const recipe of favoritesList) {
      const ok = await removeFavorite(recipe.id);
      if (ok) deletedCount++;
    }
    setShowDeleteAllConfirm(false);
    if (deletedCount > 0) {
      showError(`Todas las recetas eliminadas (${deletedCount})`);
    } else {
      showError("No se pudieron eliminar las recetas");
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 background-grid">
      <Navbar userPhoto={userPhoto} />

      <div className="flex-grow p-4 md:p-6 mb-12.5">
        <div className="max-w-7xl mx-auto pt-0 md:pt-2">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 bg-yellow-400 dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className="w-6 h-6 text-white fill-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Recetas Favoritas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {favoritesList.length} {favoritesList.length === 1 ? 'receta guardada' : 'recetas guardadas'} en tu colección
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            {favoritesList.length > 0 && (
              <div className="flex items-center gap-2">
                {!selectionMode ? (
                  <>
                    <motion.button
                      type="button"
                      onClick={() => setSelectionMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Seleccionar</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Eliminar todo</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    type="button"
                    onClick={exitSelectionMode}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancelar</span>
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoadingFavorites ? (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4"
                    animate={{ rotate: 0 }}
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
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aún no tienes favoritos</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg mb-6">
                  Marca recetas con el corazón para guardarlas aquí y poder consultarlas cuando quieras.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.history.back()}
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Explorar Recetas
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {favoritesList.map((recipe, index) => {
                  const isSelected = selectedIds.has(recipe.id);
                  return (
                  <motion.div
                    key={recipe.id}
                    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden group flex flex-col h-full ${
                      isSelected 
                        ? 'border-yellow-400 dark:border-yellow-500 shadow-lg ring-2 ring-yellow-400 dark:ring-yellow-500' 
                        : 'border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50'
                    }`}
                    variants={itemVariants}
                    whileHover={{ y: selectionMode ? 0 : -5 }}
                    onClick={() => selectionMode && toggleSelection(recipe.id)}
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox o icono */}
                          {selectionMode ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-yellow-400 dark:bg-yellow-500' 
                                  : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(recipe.id);
                              }}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-6 h-6 text-white" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-400" />
                              )}
                            </motion.div>
                          ) : (
                            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                              <ChefHat className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                              {recipe.nombre || `Receta ${index + 1}`}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{recipe.tiempo || "Tiempo no estimado"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{recipe.ingredientes?.length || 0} ingredientes</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción en el header */}
                        {!selectionMode && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Botón Ver Detalles */}
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRecipeDetail(recipe, index);
                            }}
                            className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Ver detalles"
                            title="Ver receta completa"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>

                          {/* Menú compacto (compartir) */}
                          <div className="relative" id={`fav-menu-${index}`}>
                            <motion.button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIndex((v) => (v === index ? null : index));
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Más opciones"
                              title="Compartir / Copiar"
                            >
                              <Share2 className="w-5 h-5" />
                            </motion.button>

                            {openMenuIndex === index && (
                              <ShareMenu
                                onShareText={async () => {
                                  setOpenMenuIndex(null);
                                  const shareText = formatRecipeForText(recipe, index);
                                  const ok = await shareSmart(shareText, recipe.nombre || `Receta ${index + 1}`);
                                  if (ok) showSuccess("Hoja de compartir abierta", 1800);
                                }}
                                onCopyText={async () => {
                                  setOpenMenuIndex(null);
                                  const shareText = formatRecipeForText(recipe, index);
                                  const ok = await copyToClipboard(shareText);
                                  ok ? showSuccess("Receta copiada", 1800) : showError("No se pudo copiar", 1800);
                                }}
                                onShareImage={async () => {
                                  setOpenMenuIndex(null);
                                  await shareRecipeAsImage(
                                    recipe,
                                    index,
                                    showSuccess,
                                    showError
                                  );
                                }}
                              />
                            )}
                          </div>

                          {/* Quitar de favoritos */}
                          <motion.button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = await toggleFavorite({
                                nombre: recipe.nombre,
                                ingredientes: recipe.ingredientes,
                                pasos: recipe.pasos,
                                tiempo: recipe.tiempo,
                              });
                              ok
                                ? showError("Eliminado de favoritos")
                                : showError("No se pudo actualizar el favorito");
                            }}
                            className="p-1.5 rounded-full transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Quitar de favoritos"
                          >
                            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                          </motion.button>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Ingredients Preview */}
                    <div className="px-5 pb-3">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Ingredientes principales
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(recipe.ingredientes || []).slice(0, 3).map((ing: string, i: number) => (
                          <span
                            key={i}
                            className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs"
                          >
                            {ing.split(' ').slice(0, 2).join(' ')}
                          </span>
                        ))}
                        {(recipe.ingredientes || []).length > 3 && (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                            +{(recipe.ingredientes || []).length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Steps Preview */}
                    <div className="px-5 pb-4 flex-1">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Pasos
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {(recipe.pasos || []).slice(0, 1).map((paso: string, i: number) => (
                          <span key={i}>{paso}</span>
                        ))}
                      </p>
                      {(recipe.pasos || []).length > 1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          +{(recipe.pasos || []).length - 1} pasos más
                        </p>
                      )}
                    </div>
                  </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Barra flotante de acciones de selección */}
      <AnimatePresence>
        {selectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-center gap-3 md:gap-4 border border-gray-700">
              <span className="text-sm font-medium whitespace-nowrap">
                {selectedIds.size} seleccionada{selectedIds.size !== 1 && 's'}
              </span>
              
              <div className="h-6 w-px bg-gray-600 hidden md:block" />
              
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Seleccionar todo
              </button>
              
              <div className="h-6 w-px bg-gray-600 hidden md:block" />
              
              <button
                type="button"
                onClick={deselectAll}
                className="text-sm text-gray-300 hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Deseleccionar 
              </button>
              
              <div className="h-6 w-px bg-gray-600 hidden md:block" />
              
              <motion.button
                type="button"
                onClick={() => setShowDeleteSelectedConfirm(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Eliminar</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación: Eliminar seleccionados */}
      <AnimatePresence>
        {showDeleteSelectedConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteSelectedConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Eliminar recetas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'receta' : 'recetas'}?
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteSelectedConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación: Eliminar todo */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteAllConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Eliminar todo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar <strong>todas</strong> tus recetas favoritas ({favoritesList.length})?
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={deleteAll}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium cursor-pointer"
                >
                  Eliminar todo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalles de Receta */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={closeRecipeDetail}
        index={selectedRecipeIndex}
      />

      <TempMessageToast message={tempMessage} type={tempMessageType} />

      <Footer />
    </main>
  );
}