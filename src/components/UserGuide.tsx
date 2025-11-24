"use client";

import ParticleBackground from "@/components/ParticleBackground";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  X, BookOpen, ChefHat, Search, Utensils, BookText, Lightbulb, Shield, Menu,
  Target, Zap, Eye, CheckCircle, Clock, MapPin, Moon, Heart,
  Sparkles, ClipboardList, Settings, Users, Globe, Plus, PlayCircle, Scale, AlertTriangle,
  Volume2, Share2, Copy, Image as ImageIcon, Camera
} from "lucide-react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { theme } = useTheme();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const Novedad = ({ children }: { children?: React.ReactNode }) => (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-400 ml-2">
      <Sparkles className="w-4 h-4" /> {children || "Nuevo en este MVP"}
    </span>
  );
    if (!isOpen) return null;
  

  const sections = [
    {
      id: "inicio",
      title: "Bienvenido a Chefcito AI",
      icon: ChefHat,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-3">
              <Lightbulb className="w-5 h-5" />
              ¡Descubre el poder de la IA en tu cocina!
            </h3>
            <p className="text-yellow-800 dark:text-yellow-300 text-base">
              Chefcito AI te ayuda a crear recetas personalizadas basadas en tus ingredientes y preferencias.
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> ¿Qué puedes hacer?
              </h4>
              <ul className="text-purple-700 dark:text-purple-400 text-xs space-y-2">
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> Generar recetas con ingredientes disponibles</li>
                <li className="flex items-center gap-2"><Eye className="w-3 h-3" /> Analizar recetas existentes</li>
                <li className="flex items-center gap-2"><Heart className="w-3 h-3" /> Guardar y gestionar favoritos</li>
                <li className="flex items-center gap-2"><Moon className="w-3 h-3" /> Modo claro/oscuro</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Características
              </h4>
              <ul className="text-green-700 dark:text-green-400 text-xs space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Interfaz intuitiva y responsive</li>
                <li className="flex items-center gap-2"><Users className="w-3 h-3" /> Recomendaciones personalizadas</li>
                <li className="flex items-center gap-2"><Shield className="w-3 h-3" /> Control de alergias e ingredientes</li>
                <li className="flex items-center gap-2"><Globe className="w-3 h-3" /> Soporte multi-dispositivo</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ingredientes",
      title: "Ingredientes → Recetas",
      icon: Utensils,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Crea recetas mágicas
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Convierte tus ingredientes en deliciosas recetas paso a paso.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm"><Search className="w-4 h-4" /> Cómo usar:</h4>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Agrega tus ingredientes</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Escribe cada ingrediente. Puedes sumar tantos como necesites.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Fechas de vencimiento (opcional)</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Marca lo que está por vencer. Verás etiquetas de <b>Vence en…</b> o <b>Vencido</b>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Genera recetas</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Haz clic en <b>Buscar recetas</b> y la IA creará opciones personalizadas para ti.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Consejos</h4>
            <ul className="text-yellow-700 dark:text-yellow-400 text-sm">
              <li className="flex items-center gap-2"><Plus className="w-3 h-3" /> Cuantos más ingredientes agregues, más variedad.</li>
              <li className="flex items-center gap-2"><Clock className="w-3 h-3" /> Los próximos a vencer se priorizan en recetas.</li>
              <li className="flex items-center gap-2"><Heart className="w-3 h-3" /> Consideramos alergias y preferencias.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "voz",
      title: "Entrada por voz y TTS",
      icon: PlayCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h3 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Control por voz
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">Habla tus ingredientes con el micrófono y edítalos antes de generar recetas.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-6 h-6 bg-green-800 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Graba y edita </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Usa el botón de micrófono. La transcripción aparece editable para corregir nombres o separar por comas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-6 h-6 bg-green-800 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Mezcla voz + texto </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Se combinan sin duplicados con los ingredientes escritos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-6 h-6 bg-green-800 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Escucha recetas (TTS) </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Cada tarjeta tiene un botón de <b>play/pausa</b> para escuchar ingredientes y pasos. El audio sigue solo para la receta activa.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-6 h-6 bg-green-800 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Permisos y compatibilidad</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Si el navegador pide permisos de micrófono, acéptalos. En iOS puede requerir interacción previa (tocar un botón) para iniciar audio.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "foto",
      title: "Análisis por Imagen" ,
      icon: Camera,
      content: (
        <div className="space-y-4">

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Agrega ingredientes por foto
              <Novedad />
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Sube una foto del plato o ingredientes y la IA los identificará automáticamente para generar recetas más precisas.
            </p>
          </div>



          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Cómo funciona:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Inserta la foto <Novedad /></p> 
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Sube una foto de tu plato o ingredientes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Analiza con IA <Novedad /></p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Chefcito AI identificará los ingredientes, cantidades y pasos cuando sea posible.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Opcional * <Novedad /></p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Añade o edita los ingredientes detectados si deseas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Revisa los resultados <Novedad /></p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1"> Obtén una lista organizada de ingredientes y comentarios útiles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ideal para:
            </h4>
            <p className="text-yellow-700 dark:text-yellow-400 text-xs">
              Personas que prefieren mostrar una foto del plato en vez de escribir o dictar ingredientes.
            </p>
          </div>

        </div>
      )
    },
    {
      id: "compartir",
      title: "Compartir y guardar",
      icon: Share2,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Comparte tus recetas
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">Desde el menú de cada receta puedes compartir o copiar fácilmente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Opciones de compartir <Novedad /></h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2"><Share2 className="w-3 h-3" /> Web Share (hoja nativa del dispositivo)</li>
                <li className="flex items-center gap-2"><Share2 className="w-3 h-3" /> WhatsApp (app o Web)</li>
                <li className="flex items-center gap-2"><Copy className="w-3 h-3" /> Copiar receta en formato legible</li>
                <li className="flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Compartir/descargar <b>imagen PNG</b> de la tarjeta</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Favoritos persistentes <Novedad /></h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2"><Heart className="w-3 h-3" /> Agrega o quita favoritos con el corazón</li>
                <li className="flex items-center gap-2"><Users className="w-3 h-3" /> Requiere sesión para guardar en tu cuenta</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Mensajes de confirmación (agregado/eliminado)</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Notas</h4>
            <ul className="text-green-800 dark:text-green-300 text-xs space-y-2">
              <li>Si tu dispositivo no soporta compartir archivos, la imagen se descarga automáticamente.</li>
              <li>Si ves el mensaje de límite (<code>429</code>), espera un momento antes de volver a generar.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "analisis",
      title: "Análisis de Recetas",
      icon: BookText,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Descubre ingredientes
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">Analiza cualquier receta para obtener su lista de ingredientes y pasos de preparación.</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Cómo funciona:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Pega la receta</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Copia y pega cualquier receta que encuentres o que tengas guardada.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Analiza con IA</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Identificamos ingredientes, cantidades y pasos cuando sea posible.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Revisa los resultados</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Obtén una lista organizada de ingredientes y comentarios útiles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Mejores prácticas</h4>
            <ul className="text-yellow-700 dark:text-yellow-400 text-xs space-y-2">
              <li className="flex items-center gap-2"><ClipboardList className="w-3 h-3" /> Copia recetas completas para mejores resultados</li>
              <li className="flex items-center gap-2"><Scale className="w-3 h-3" /> Incluye cantidades y medidas cuando sea posible</li>
              <li className="flex items-center gap-2"><Globe className="w-3 h-3" /> Podemos identificar ingredientes regionales</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "preferencias",
      title: "Preferencias y Configuración",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Personaliza tu experiencia
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">Configura tus preferencias para recomendaciones más precisas y seguras.</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Alergias Alimentarias</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Registra todas tus alergias para que las recetas las eviten automáticamente (maní, lactosa, gluten, mariscos, etc.).</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> Tipos de Cocina Preferidos</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Selecciona estilos culinarios favoritos. La IA los prioriza (también puedes agregar personalizados).</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Ubicación</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Indica tu país para recetas con ingredientes locales.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2"><Moon className="w-4 h-4" /> Modo Claro/Oscuro</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Cambia el tema cuando quieras. Recordamos tu elección.</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Tus datos están seguros</h4>
            <p className="text-green-700 dark:text-green-400 text-xs">Tus preferencias se almacenan de forma segura y solo se usan para mejorar tus recetas.</p>
          </div>
        </div>
      ),
    },
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
            className="fixed inset-0 bg-black bg-opacity-60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden ${
              isMobile ? "inset-0 rounded-none" : "inset-4 md:inset-20 rounded-3xl"
            }`}
          >
            <ParticleBackground theme={theme} />
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-7 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Manual de Usuario</h2>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Aprende a usar Chefcito AI al máximo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isMobile && (
                  <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
                <button onClick={onClose} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              {(!isMobile || showMobileSidebar) && (
                <motion.div
                  initial={isMobile ? { x: -300 } : false}
                  animate={isMobile ? { x: 0 } : false}
                  exit={isMobile ? { x: -300 } : undefined}
                  className={`bg-gray-100 dark:bg-gray-800 overflow-y-auto ${
                    isMobile ? "absolute inset-y-0 left-0 w-64 z-10 shadow-lg" : "w-64 border-r border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <nav className="p-5 space-y-3">
                    {sections.map((section) => {
                      const IconComponent = section.icon as any;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            if (isMobile) setShowMobileSidebar(false);
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors ${
                            activeSection === section.id
                              ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                              : "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
                          <span className="text-base font-medium">{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              )}

              {/* Overlay para cerrar sidebar en móvil */}
              {isMobile && showMobileSidebar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-0" onClick={() => setShowMobileSidebar(false)} />
              )}

              {/* Main */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                <div className="max-w-3xl mx-auto">
                  {sections
                    .filter((section) => section.id === activeSection)
                    .map((section) => (
                      <div key={section.id} className="space-y-5 sm:space-y-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-xl flex items-center justify-center">
                            <section.icon className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
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
