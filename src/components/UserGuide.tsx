"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, BookOpen, ChefHat, Search, Utensils, BookText, Lightbulb, Shield, Menu,
  Target, Zap, Eye, CheckCircle, Clock, MapPin, Moon, Heart,
  Sparkles, ClipboardList, Settings, Users, Globe, Plus, PlayCircle, Scale, AlertTriangle
} from "lucide-react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sections = [
    {
      id: "inicio",
      title: "Bienvenido a Chefcito AI",
      icon: ChefHat,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              ¡Descubre el poder de la IA en tu cocina!
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Chefcito AI te ayuda a crear recetas personalizadas basadas en tus ingredientes y preferencias.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                ¿Qué puedes hacer?
              </h4>
              <ul className="text-blue-700 dark:text-blue-400 text-xs space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Generar recetas con ingredientes disponibles
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Analizar recetas existentes
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-3 h-3" />
                  Guardar tus preferencias alimenticias
                </li>
                <li className="flex items-center gap-2">
                  <Moon className="w-3 h-3" />
                  Modo claro/oscuro
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Características
              </h4>
              <ul className="text-green-700 dark:text-green-400 text-xs space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Interfaz intuitiva y responsive
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Recomendaciones personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Control de alergias e ingredientes
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Soporte multi-dispositivo
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ingredientes",
      title: "Ingredientes → Recetas",
      icon: Utensils,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Crea recetas mágicas
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Convierte tus ingredientes en deliciosas recetas paso a paso.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" />
              Cómo usar:
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Agrega tus ingredientes</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Escribe cada ingrediente que tengas disponible. Puedes agregar tantos como necesites.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Fechas de vencimiento (opcional)</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Marca los ingredientes que están por vencer para priorizar su uso.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Genera recetas</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Haz clic en "Buscar recetas" y nuestra IA creará recetas personalizadas para ti.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Consejos
            </h4>
            <ul className="text-blue-700 dark:text-blue-400 text-xs space-y-2">
              <li className="flex items-center gap-2">
                <Plus className="w-3 h-3" />
                Cuantos más ingredientes agregues, más variadas serán las recetas
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Los ingredientes próximos a vencer aparecerán destacados
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3 h-3" />
                Las recetas consideran tus alergias y preferencias
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "analisis",
      title: "Análisis de Recetas",
      icon: BookText,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Descubre ingredientes
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Analiza cualquier receta para obtener su lista de ingredientes y pasos de preparación.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Cómo funciona:
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Pega la receta</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Copia y pega cualquier receta que encuentres en internet o que tengas guardada.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Analiza con IA</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Nuestra IA identificará automáticamente los ingredientes y pasos de preparación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Revisa los resultados</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Obtén una lista organizada de ingredientes y comentarios útiles sobre la receta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mejores prácticas
            </h4>
            <ul className="text-blue-700 dark:text-blue-400 text-xs space-y-2">
              <li className="flex items-center gap-2">
                <ClipboardList className="w-3 h-3" />
                Copia recetas completas para mejores resultados
              </li>
              <li className="flex items-center gap-2">
                <Scale className="w-3 h-3" />
                Incluye cantidades y medidas cuando sea posible
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                La IA puede identificar ingredientes regionales y especializados
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "preferencias",
      title: "Preferencias y Configuración",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Personaliza tu experiencia
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Configura tus preferencias para recibir recomendaciones más precisas y seguras.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alergias Alimentarias
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Registra todas tus alergias para que las recetas las eviten automáticamente. 
                Puedes agregar múltiples alergias como: maní, lactosa, gluten, mariscos, etc.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Tipos de Cocina Preferidos
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Selecciona tus estilos culinarios favoritos. La IA priorizará recetas de estas cocinas.
                También puedes agregar tipos de cocina personalizados.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Indica tu país para recibir recetas con ingredientes locales y disponibles en tu región.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Modo Claro/Oscuro
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Cambia entre temas claro y oscuro según tu preferencia. El sistema recuerda tu elección.
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Tus datos están seguros
            </h4>
            <p className="text-green-700 dark:text-green-400 text-xs">
              Toda tu información de preferencias se almacena de forma segura y solo se usa 
              para mejorar tus recomendaciones de recetas.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Modal - Diseño diferente para móvil */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white dark:bg-gray-800 shadow-xl flex flex-col overflow-hidden ${
              isMobile 
                ? "inset-0 rounded-none" 
                : "inset-4 md:inset-20 rounded-2xl"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Manual de Usuario
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Aprende a usar Chefcito AI al máximo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Botón menú en móvil */}
                {isMobile && (
                  <button
                    onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar - Oculto en móvil por defecto */}
              {(!isMobile || showMobileSidebar) && (
                <motion.div
                  initial={isMobile ? { x: -300 } : false}
                  animate={isMobile ? { x: 0 } : false}
                  exit={isMobile ? { x: -300 } : undefined}
                  className={`bg-gray-50 dark:bg-gray-900 overflow-y-auto ${
                    isMobile 
                      ? "absolute inset-y-0 left-0 w-64 z-10 shadow-lg" 
                      : "w-64 border-r border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <nav className="p-4 space-y-2">
                    {sections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            if (isMobile) setShowMobileSidebar(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                            activeSection === section.id
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              )}

              {/* Overlay para cerrar sidebar en móvil */}
              {isMobile && showMobileSidebar && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 z-0"
                  onClick={() => setShowMobileSidebar(false)}
                />
              )}

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-3xl mx-auto">
                  {sections
                    .filter((section) => section.id === activeSection)
                    .map((section) => (
                      <div key={section.id} className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                            <section.icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {section.title}
                          </h3>
                        </div>
                        {section.content}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}