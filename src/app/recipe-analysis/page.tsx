"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  BookOpen,
  Search,
  Clock,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RecipeAnalysisPage() {
  const router = useRouter();
  const { userPhoto, userPreferences, isLoading } = useUserData();
  const [recipe, setRecipe] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAnalyzeRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe.trim()) return;

    setLoading(true);
    setAnalysis(null);
    setHasSearched(true);

    try {
      const payload = {
        recipe: recipe.trim(),
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

      const data = await response.json();
      setAnalysis(data.analysis || null);
    } catch (error) {
      console.error("Error:", error);
      setAnalysis({
        receta: recipe,
        ingredientes: [],
        comentario:
          "Hubo un error al analizar la receta. Por favor, intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecipe("");
    setAnalysis(null);
    setHasSearched(false);
  };

  const scrollToAnalysis = () => {
    if (isMobile && analysis) {
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }, 500);
    }
  };

  // Efecto para scroll automático en móvil
  useEffect(() => {
    if (isMobile && analysis && !loading) {
      scrollToAnalysis();
    }
  }, [analysis, loading, isMobile]);

  // Animaciones
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const mobileAnalysisVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const desktopAnalysisVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Navbar userPhoto={userPhoto} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-5"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600"
            >
              Cargando...
            </motion.p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Navbar userPhoto={userPhoto} />
      <div className="flex-grow p-4 md:p-6">
        <motion.div
          className={`${hasSearched && !isMobile ? 'max-w-7xl' : 'max-w-4xl'} mx-auto transition-all duration-300 pt-0 md:pt-2`}
          initial={false}
          animate={{ maxWidth: hasSearched && !isMobile ? '1280px' : '896px' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BookOpen className="w-5 h-5 text-green-600" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Receta → Análisis
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Descubre los ingredientes de cualquier receta
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className={`
            ${isMobile 
              ? 'flex flex-col space-y-6' 
              : hasSearched 
                ? 'flex flex-row gap-8 items-start' 
                : 'flex flex-col items-center'
            }
          `}>
            
            {/* Form Section */}
            <motion.div
              layout
              className={`
                ${isMobile 
                  ? 'w-full' 
                  : hasSearched 
                    ? 'w-1/2 sticky top-6' 
                    : 'w-full'
                }
              `}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                layout
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <form onSubmit={handleAnalyzeRecipe} className="space-y-4 md:space-y-6">
                  <motion.div variants={itemVariants}>
                    <input
                      type="text"
                      value={recipe}
                      onChange={(e) => setRecipe(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-black focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-colors text-sm md:text-base"
                      placeholder="Ej: Paella valenciana, Tacos al pastor, Risotto..."
                    />
                  </motion.div>

                  <motion.div 
                    className="flex flex-col sm:flex-row gap-3"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading || !recipe.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                      whileHover={{ 
                        scale: (loading || !recipe.trim()) ? 1 : 1.02,
                        boxShadow: (loading || !recipe.trim()) ? "none" : "0 4px 12px rgba(34, 197, 94, 0.3)"
                      }}
                      whileTap={{ scale: (loading || !recipe.trim()) ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Analizando receta...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Analizar ingredientes
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>

            {/* Analysis Section */}
            <AnimatePresence mode="popLayout">
              {(hasSearched || analysis) && (
                <motion.div
                  key="analysis-section"
                  id="analysis-section"
                  className={`
                    ${isMobile 
                      ? 'w-full' 
                      : 'w-1/2 -mt-4'
                    }
                  `}
                  variants={isMobile ? mobileAnalysisVariants : desktopAnalysisVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {analysis ? (
                    <motion.div 
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div 
                          className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0"
                          whileHover={{ rotate: 5 }}
                        >
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        </motion.div>
                        <div className="flex-1">
                          <motion.h4 
                            className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            {analysis.receta || "Análisis de receta"}
                          </motion.h4>
                          <motion.div 
                            className="flex items-center gap-2 text-xs md:text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{analysis.tiempo || "Tiempo no estimado"}</span>
                          </motion.div>
                        </div>
                      </motion.div>

                      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <h5 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                            Lista de ingredientes:
                          </h5>
                          <div className="space-y-2">
                            {(analysis.ingredientes || []).map(
                              (ing: string, i: number) => (
                                <motion.div
                                  key={i}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.05 }}
                                  whileHover={{ x: 5 }}
                                >
                                  <motion.div 
                                    className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"
                                    whileHover={{ scale: 1.5 }}
                                  />
                                  <span className="text-gray-700 text-sm md:text-base">{ing}</span>
                                </motion.div>
                              )
                            )}
                          </div>
                        </motion.div>

                        {analysis.comentario && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            <h5 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                              Notas adicionales:
                            </h5>
                            <motion.div 
                              className="p-3 md:p-4 bg-blue-50 border border-blue-100 rounded-lg"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9 }}
                            >
                              <p className="text-blue-800 text-xs md:text-sm leading-relaxed">
                                {analysis.comentario}
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : loading ? (
                    <motion.div
                      className="flex items-center justify-center py-8 md:py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <motion.div
                          className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-full mb-3 md:mb-4"
                          animate={{ 
                            rotate: 360,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                          }}
                        >
                          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </motion.div>
                        <motion.p 
                          className="text-gray-600 font-medium text-sm md:text-base"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Analizando receta...
                        </motion.p>
                      </div>
                    </motion.div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}