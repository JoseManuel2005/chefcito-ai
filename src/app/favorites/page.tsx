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
import { useTheme } from "@/contexts/ThemeContext";
import ParticleBackground from "@/components/ParticleBackground";
import {
  formatRecipeForText,
  copyToClipboard,
  shareSmart,
  shareRecipeAsImage,
} from "@/utils/shareUtils";
import { containerVariants, itemVariants } from "@/utils/animations";
import {
  Heart,
  Clock,
  Trash2,
  Users,
  Eye,
  Share2,
  CheckSquare,
  Square,
  X,
  Grid3x3,
  List,
  Maximize2,
  Minimize2,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import ChiefLogo from "@/components/ChiefLogo";

// Función helper para calcular tiempo relativo
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffInMs / 60000);
  const hours = Math.floor(diffInMs / 3600000);
  const days = Math.floor(diffInMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  if (weeks < 4) return `Hace ${weeks} sem`;
  if (months < 12) return `Hace ${months} meses`;
  return `Hace ${years} año${years > 1 ? 's' : ''}`;
}

export default function FavoritesPage() {
  const { userPhoto } = useUserData();
  const { favorites, isLoadingFavorites, toggleFavorite, removeFavorite } = useFavoriteRecipes();
  const { tempMessage, tempMessageType, showError, showSuccess } = useTempMessage();
  const { openMenuIndex, setOpenMenuIndex } = useMenuToggle("fav-menu");
  const { theme } = useTheme();
  
  // Estado para el modal de detalles
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  
  // Estados para la imagen del plato en el modal
  const [modalDishImage, setModalDishImage] = useState<string | undefined>();
  const [modalShowDishImage, setModalShowDishImage] = useState(false);
  const [modalLoadingDishImage, setModalLoadingDishImage] = useState(false);
  
  // Estados para las imágenes de los pasos en el modal
  const [modalStepImages, setModalStepImages] = useState<string[]>([]);
  const [modalLoadingSteps, setModalLoadingSteps] = useState(false);
  
  // Estados para selección múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  
  // Estados para vistas
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewSize, setViewSize] = useState<'compact' | 'expanded'>('expanded');
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'ingredients'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const favoritesList = useMemo(() => Array.from(favorites.values()), [favorites]);

  // Filtrar y ordenar favoritos
  const filteredAndSortedFavorites = useMemo(() => {
    let result = [...favoritesList];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(recipe => 
        recipe.nombre.toLowerCase().includes(query) ||
        recipe.ingredientes.some(ing => ing.toLowerCase().includes(query))
      );
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'date':
          // Para fechas, más recientes primero es el orden natural (desc)
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'ingredients':
          comparison = a.ingredientes.length - b.ingredientes.length;
          break;
      }
      // Si sortOrder es 'asc', mantener comparison normal
      // Si sortOrder es 'desc', invertir
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [favoritesList, searchQuery, sortBy, sortOrder]);

  const openRecipeDetail = (recipe: Recipe, index: number) => {
    setSelectedRecipe(recipe);
    setSelectedRecipeIndex(index);
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
    setSelectedRecipeIndex(null);
    setModalDishImage(undefined);
    setModalShowDishImage(false);
    setModalStepImages([]);
  };

  // Función para generar imágenes de los pasos en el modal
  const handleModalGenerateSteps = async () => {
    if (!selectedRecipe || !selectedRecipe.pasos || selectedRecipe.pasos.length === 0) return;

    setModalLoadingSteps(true);

    try {
      const images: string[] = [];
      
      // Generar imagen para cada paso
      for (const step of selectedRecipe.pasos) {
        const res = await fetch("/api/generate-step-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepText: step }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error("Error al generar imagen del paso");
        }

        const data = await res.json();
        console.log("Respuesta de la API para paso:", data);

        if (data.imageBase64) {
          images.push(data.imageBase64);
        } else {
          console.warn("No se recibió imagen para este paso");
          images.push(''); // Placeholder vacío
        }
      }

      console.log("Imágenes de pasos generadas:", images.length);
      setModalStepImages(images);
    } catch (error) {
      console.error("Error generando imágenes de pasos:", error);
      showError("No se pudieron generar las imágenes de preparación");
    } finally {
      setModalLoadingSteps(false);
    }
  };

  // Función para generar imagen del plato en el modal
  const handleModalGenerateImage = async () => {
    if (!selectedRecipe) return;

    if (modalDishImage) {
      // Si ya existe la imagen, toggle de visibilidad
      console.log("Toggle imagen - nuevo estado:", !modalShowDishImage);
      setModalShowDishImage(!modalShowDishImage);
      return;
    }

    setModalLoadingDishImage(true);
    console.log("Generando imagen para:", selectedRecipe.nombre);

    try {
      const res = await fetch("/api/generate-dish-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: selectedRecipe.nombre || "Receta",
          ingredients: selectedRecipe.ingredientes || [],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error("Error al generar imagen");
      }

      const data = await res.json();
      console.log("Respuesta de la API:", data);
      
      if (data.imageBase64) {
        console.log("Imagen recibida, longitud:", data.imageBase64.length);
        setModalDishImage(data.imageBase64);
        setModalShowDishImage(true);
        console.log("Estados actualizados - imagen y show=true");
      } else {
        console.warn("No se recibió imagen en la respuesta");
      }
    } catch (error) {
      console.error("Error generando imagen:", error);
      showError("No se pudo generar la imagen");
    } finally {
      setModalLoadingDishImage(false);
      console.log("Loading finalizado");
    }
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
    <main className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
      theme === "dark" ? "dark bg-gray-950" : "bg-white"
    }`}>
      {/* Canvas de partículas */}
      <ParticleBackground theme={theme} dependencies={[favoritesList.length]} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar userPhoto={userPhoto} />

        <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mb-12">
          <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Fila 1: Título */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {/* Badge estilo home */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[11px] font-medium text-gray-900 shadow-md backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/80 dark:text-gray-100 mb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-white dark:bg-pink-500">
                    <Heart className="h-3 w-3 fill-current" />
                  </div>
                  <span>Tus recetas favoritas · {favoritesList.length} guardadas</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                  Tu colección
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-400 to-rose-300">
                    de sabores favoritos
                  </span>
                </h1>
              </div>

              {/* Botones de acción */}
              {favoritesList.length > 0 && (
                <div className="flex items-center gap-2">
                  {!selectionMode ? (
                    <>
                      <motion.button
                        type="button"
                        onClick={() => setSelectionMode(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-md hover:shadow-lg transition-all cursor-pointer dark:bg-gray-900/90 dark:text-gray-100 border border-white/70 dark:border-gray-800/80"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Seleccionar</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setShowDeleteAllConfirm(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-red-50/90 px-4 py-2 text-sm font-semibold text-red-600 shadow-md hover:shadow-lg transition-all cursor-pointer dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar todo</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={exitSelectionMode}
                      className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-md hover:shadow-lg transition-all cursor-pointer dark:bg-gray-900/90 dark:text-gray-100 border border-white/70 dark:border-gray-800/80"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Fila 2: Búsqueda, filtros y controles de vista */}
            {favoritesList.length > 0 && (
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                {/* Barra de búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar recetas o ingredientes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-white/60 bg-white/80 backdrop-blur text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:border-gray-800/80 dark:bg-gray-900/80 dark:text-white dark:placeholder-gray-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Controles de la derecha */}
                <div className="flex items-center gap-2">
                  {/* Botón filtros */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md transition-all cursor-pointer border ${
                      showFilters
                        ? 'bg-gray-900 text-amber-200 border-gray-900 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30'
                        : 'bg-white/80 text-gray-900 border-white/60 hover:bg-gray-100 hover:border-gray-200 dark:bg-gray-900/80 dark:text-white dark:border-gray-800/80 dark:hover:bg-gray-800/80'
                    } backdrop-blur`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filtros</span>
                  </button>

                  {/* Toggle Grid/List */}
                  <div className="flex items-center border border-white/60 bg-white/80 backdrop-blur rounded-full p-1 shadow-md dark:border-gray-800/80 dark:bg-gray-900/80">
                    <motion.button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-gray-900 text-amber-200 shadow-sm dark:bg-amber-500/20 dark:text-amber-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      <span className="text-sm font-medium hidden xl:inline">Grid</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-gray-900 text-amber-200 shadow-sm dark:bg-amber-500/20 dark:text-amber-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <List className="w-4 h-4" />
                      <span className="text-sm font-medium hidden xl:inline">Lista</span>
                    </motion.button>
                  </div>

                  {/* Toggle Compact/Expanded */}
                  <div className="flex items-center border border-white/60 bg-white/80 backdrop-blur rounded-full p-1 shadow-md dark:border-gray-800/80 dark:bg-gray-900/80">
                    <motion.button
                      type="button"
                      onClick={() => setViewSize('compact')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        viewSize === 'compact'
                          ? 'bg-gray-900 text-amber-200 shadow-sm dark:bg-amber-500/20 dark:text-amber-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      title="Vista compacta"
                    >
                      <Minimize2 className="w-4 h-4" />
                      <span className="text-sm font-medium hidden xl:inline">Compacta</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setViewSize('expanded')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        viewSize === 'expanded'
                          ? 'bg-gray-900 text-amber-200 shadow-sm dark:bg-amber-500/20 dark:text-amber-200'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      title="Vista expandida"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-sm font-medium hidden xl:inline">Expandida</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel de filtros expandible */}
            <AnimatePresence>
              {showFilters && favoritesList.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[1.5rem] border border-white/60 bg-white/80 backdrop-blur p-4 shadow-md dark:border-gray-800/80 dark:bg-gray-900/80">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ordenar:</span>
                        <div className="flex gap-2 flex-wrap">
                          {/* Fecha */}
                          <button
                            onClick={() => {
                              if (sortBy === 'date') {
                                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                              } else {
                                setSortBy('date');
                                setSortOrder('desc');
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              sortBy === 'date'
                                ? 'bg-gray-900 text-amber-200 dark:bg-amber-500/20 dark:text-amber-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {sortBy === 'date' && sortOrder === 'asc' ? (
                              <><ArrowUp className="w-3 h-3" /> Más antiguas</>
                            ) : (
                              <><ArrowDown className="w-3 h-3" /> Más recientes</>
                            )}
                          </button>
                          
                          {/* Nombre */}
                          <button
                            onClick={() => {
                              if (sortBy === 'name') {
                                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortBy('name');
                                setSortOrder('asc');
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              sortBy === 'name'
                                ? 'bg-gray-900 text-amber-200 dark:bg-amber-500/20 dark:text-amber-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {sortBy === 'name' && sortOrder === 'desc' ? (
                              <><ArrowDown className="w-3 h-3" /> Z-A</>
                            ) : (
                              <><ArrowUp className="w-3 h-3" /> A-Z</>
                            )}
                          </button>
                          
                          {/* Ingredientes */}
                          <button
                            onClick={() => {
                              if (sortBy === 'ingredients') {
                                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortBy('ingredients');
                                setSortOrder('asc');
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              sortBy === 'ingredients'
                                ? 'bg-gray-900 text-amber-200 dark:bg-amber-500/20 dark:text-amber-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            {sortBy === 'ingredients' && sortOrder === 'desc' ? (
                              <><ArrowDown className="w-3 h-3" /> Más ingredientes</>
                            ) : (
                              <><ArrowUp className="w-3 h-3" /> Menos ingredientes</>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block" />

                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">
                          {filteredAndSortedFavorites.length} de {favoritesList.length} recetas
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    <ChiefLogo className="w-8 h-8 text-white" />
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
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
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
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900/95 px-6 py-3 text-sm font-semibold text-amber-200 shadow-lg hover:shadow-xl transition-all cursor-pointer dark:bg-gray-900"
                >
                  Explorar Recetas
                </motion.button>
              </motion.div>
            ) : filteredAndSortedFavorites.length === 0 ? (
              <motion.div
                key="no-results"
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No se encontraron resultados</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  No hay recetas que coincidan con "{searchQuery}"
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-gray-900 shadow-md hover:shadow-lg transition-all cursor-pointer dark:bg-gray-900/90 dark:text-white border border-white/70 dark:border-gray-800/80"
                >
                  Limpiar búsqueda
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredAndSortedFavorites.map((recipe, index) => {
                  const isSelected = selectedIds.has(recipe.id);
                  
                  // Vista de Lista
                  if (viewMode === 'list') {
                    return (
                      <motion.div
                        key={recipe.id}
                        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden group ${
                          isSelected 
                            ? 'border-yellow-400 dark:border-yellow-500 shadow-lg ring-2 ring-yellow-400 dark:ring-yellow-500' 
                            : 'border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50'
                        }`}
                        variants={itemVariants}
                        onClick={() => selectionMode && toggleSelection(recipe.id)}
                      >
                        <div className={`flex items-center gap-4 ${viewSize === 'compact' ? 'p-4' : 'p-5'}`}>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-amber-300 shadow-md flex-shrink-0 dark:bg-gray-800">
                              <ChiefLogo className="h-5 w-5" />
                            </div>
                          )}

                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                              {recipe.nombre || `Receta ${index + 1}`}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 overflow-x-auto">
                              <div className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                <span className="whitespace-nowrap">{(recipe.tiempo || "No estimado").replace(/minutos?/gi, 'min')}</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                              <div className="flex items-center gap-1 shrink-0">
                                <UtensilsCrossed className="w-3 h-3" />
                                <span className="whitespace-nowrap">{recipe.ingredientes?.length || 0} ing</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 shrink-0">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="whitespace-nowrap">{getTimeAgo(recipe.createdAt)}</span>
                              </div>
                            </div>
                            
                            {/* Expandida: mostrar ingredientes */}
                            {viewSize === 'expanded' && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(recipe.ingredientes || []).slice(0, 4).map((ing: string, i: number) => (
                                  <span
                                    key={i}
                                    className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs"
                                  >
                                    {ing.split(' ').slice(0, 2).join(' ')}
                                  </span>
                                ))}
                                {(recipe.ingredientes || []).length > 4 && (
                                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                                    +{(recipe.ingredientes || []).length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Botones de acción */}
                          {!selectionMode && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRecipeDetail(recipe, index);
                                }}
                                className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Ver detalles"
                              >
                                <Eye className="w-5 h-5" />
                              </motion.button>

                              <div className="relative" id={`fav-menu-list-${index}`}>
                                <motion.button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuIndex((v) => (v === index ? null : index));
                                  }}
                                  className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  aria-label="Más opciones"
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
                                      await shareRecipeAsImage(recipe, index, showSuccess, showError);
                                    }}
                                  />
                                )}
                              </div>

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
                                className="p-2 rounded-full transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Quitar de favoritos"
                              >
                                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                  
                  // Vista de Grid
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
                    <div className={viewSize === 'compact' ? 'p-4 pb-2' : 'p-5 pb-3'}>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-amber-300 shadow-md flex-shrink-0 dark:bg-gray-800">
                              <ChiefLogo className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-gray-900 dark:text-white truncate ${viewSize === 'compact' ? 'text-base' : 'text-lg'}`}>
                              {recipe.nombre || `Receta ${index + 1}`}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                              <div className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                <span className="whitespace-nowrap">{(recipe.tiempo || "No estimado").replace(/minutos?/gi, 'min')}</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                              <div className="flex items-center gap-1 shrink-0">
                                <UtensilsCrossed className="w-3 h-3" />
                                <span className="whitespace-nowrap">{recipe.ingredientes?.length || 0} ing</span>
                              </div>
                            </div>
                            {viewSize === 'expanded' && (
                              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 mt-1.5 text-[11px] shrink-0">
                                <Heart className="w-3 h-3 fill-current" />
                                <span className="whitespace-nowrap">Agregado {getTimeAgo(recipe.createdAt)}</span>
                              </div>
                            )}
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

                    {/* Ingredients Preview - Solo en modo expandido */}
                    {viewSize === 'expanded' && (
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
                    )}

                    {/* Steps Preview - Solo en modo expandido */}
                    {viewSize === 'expanded' && (
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
                    )}
                    
                    {/* Padding extra en modo compacto */}
                    {viewSize === 'compact' && <div className="pb-4" />}
                  </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
        
      </div>

      {/* Barra flotante de acciones de selección */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl text-gray-900 dark:text-white rounded-full shadow-2xl px-4 md:px-6 py-3 md:py-4 flex flex-wrap items-center justify-center gap-3 md:gap-4 border border-white/60 dark:border-gray-800/80">
              {selectedIds.size > 0 ? (
                <>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {selectedIds.size} seleccionada{selectedIds.size !== 1 && 's'}
                  </span>
                  
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
                  
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Seleccionar todo
                  </button>
                  
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
                  
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Deseleccionar 
                  </button>
                  
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
                  
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteSelectedConfirm(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Eliminar</span>
                  </motion.button>
                  
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
                </>
              ) : (
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Selecciona recetas para continuar
                </span>
              )}
              
              {/* Botón cancelar integrado en la barra */}
              <motion.button
                type="button"
                onClick={exitSelectionMode}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full transition-colors cursor-pointer whitespace-nowrap shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-semibold">Cancelar</span>
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
        dishImage={modalDishImage}
        showDishImage={modalShowDishImage}
        loadingDishImage={modalLoadingDishImage}
        onGenerateImage={handleModalGenerateImage}
        stepImages={modalStepImages}
        loadingSteps={modalLoadingSteps}
        onGenerateSteps={handleModalGenerateSteps}
      />

      <TempMessageToast message={tempMessage} type={tempMessageType} />

      <Footer />
    </main>
  );
}