"use client";

import ParticleBackground from "@/components/ParticleBackground";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  X,
  BookOpen,
  ChefHat,
  Search,
  Utensils,
  BookText,
  Lightbulb,
  Shield,
  Menu,
  Target,
  Zap,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  Moon,
  Heart,
  Sparkles,
  ClipboardList,
  Settings,
  Users,
  Globe,
  Plus,
  PlayCircle,
  Scale,
  AlertTriangle,
  Volume2,
  Share2,
  Copy,
  Image as ImageIcon,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = {
  id: string;
  title: string;
  icon: LucideIcon;
  keywords?: string[];
  content: React.ReactNode;
};

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [visitedSections, setVisitedSections] = useState<Set<string>>(
    new Set(["inicio"])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  // Cargar progreso del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userGuideProgress");
    if (saved) {
      setVisitedSections(new Set(JSON.parse(saved)));
    }
  }, []);

  // Guardar progreso en localStorage
  useEffect(() => {
    localStorage.setItem(
      "userGuideProgress",
      JSON.stringify(Array.from(visitedSections))
    );
  }, [visitedSections]);

  // Marcar sección como visitada
  const markAsVisited = (sectionId: string) => {
    setVisitedSections((prev) => new Set([...prev, sectionId]));
  };

  // Badge “Novedad”
  const Novedad = ({ children }: { children?: React.ReactNode }) => (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-400 ml-2 shadow-sm">
      <Sparkles className="w-3 h-3" /> {children || "Nuevo en este MVP"}
    </span>
  );

  const sections: Section[] = [
    {
      id: "inicio",
      title: "Bienvenido a Chefcito AI",
      icon: ChefHat,
      keywords: [
        "bienvenida",
        "inicio",
        "introducción",
        "características",
        "qué puedes hacer",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-3">
              <Lightbulb className="w-5 h-5" />
              ¡Descubre el poder de la IA en tu cocina!
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-base">
              Chefcito AI te ayuda a crear recetas personalizadas basadas en tus
              ingredientes y preferencias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-100/80 dark:border-purple-900/40">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> ¿Qué puedes hacer?
              </h4>
              <ul className="text-purple-700 dark:text-purple-400 text-xs space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Generar recetas con
                  ingredientes disponibles
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Analizar recetas existentes
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Guardar y gestionar favoritos
                </li>
                <li className="flex items-center gap-2">
                  <Moon className="w-3 h-3" /> Modo claro/oscuro
                </li>
              </ul>
            </div>

            <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Características
              </h4>
              <ul className="text-green-700 dark:text-green-400 text-xs space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> Interfaz intuitiva y
                  responsive
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-3 h-3" /> Recomendaciones personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Control de alergias e
                  ingredientes
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Soporte multi-dispositivo
                </li>
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
      keywords: [
        "ingredientes",
        "recetas",
        "generar",
        "buscar",
        "vencimiento",
        "nevera",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Crea recetas mágicas
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Convierte tus ingredientes en deliciosas recetas paso a paso.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" /> Cómo usar:
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Agrega tus ingredientes
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Escribe cada ingrediente. Puedes sumar tantos como necesites.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Fechas de vencimiento (opcional)
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Marca lo que está por vencer. Verás etiquetas de{" "}
                    <b>Vence en…</b> o <b>Vencido</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60 lg:col-span-2">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Genera recetas
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Haz clic en <b>Buscar recetas</b> y la IA creará opciones
                    personalizadas para ti.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Consejos
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1.5">
              <li className="flex items-center gap-2">
                <Plus className="w-3 h-3" /> Cuantos más ingredientes agregues,
                más variedad.
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3 h-3" /> Los próximos a vencer se priorizan
                en recetas.
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3 h-3" /> Consideramos alergias y
                preferencias.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "voz",
      title: "Entrada por voz y TTS",
      icon: PlayCircle,
      keywords: [
        "voz",
        "micrófono",
        "audio",
        "tts",
        "escuchar",
        "dictar",
        "hablar",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
            <h3 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Control por voz
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Habla tus ingredientes con el micrófono y edítalos antes de
              generar recetas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[
              {
                step: "1",
                title: "Graba y edita",
                desc: "Usa el botón de micrófono. La transcripción aparece editable para corregir nombres o separar por comas.",
              },
              {
                step: "2",
                title: "Mezcla voz + texto",
                desc: "Se combinan sin duplicados con los ingredientes escritos.",
              },
              {
                step: "3",
                title: "Escucha recetas (TTS)",
                desc: "Cada tarjeta tiene un botón de play/pausa para escuchar ingredientes y pasos. El audio sigue solo para la receta activa.",
              },
              {
                step: "4",
                title: "Permisos y compatibilidad",
                desc: "Si el navegador pide permisos de micrófono, acéptalos. En iOS puede requerir interacción previa (tocar un botón) para iniciar audio.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60"
              >
                <div className="w-6 h-6 bg-green-600 dark:bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "foto",
      title: "Análisis por Imagen",
      icon: Camera,
      keywords: [
        "foto",
        "imagen",
        "cámara",
        "fotografía",
        "visual",
        "escanear",
        "identificar",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Agrega ingredientes por foto
              <Novedad />
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Sube una foto del plato o ingredientes y la IA los identificará
              automáticamente para generar recetas más precisas.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Cómo funciona:
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[
                {
                  step: "1",
                  title: (
                    <>
                      Inserta la foto <Novedad />
                    </>
                  ),
                  desc: "Sube una foto de tu plato o ingredientes.",
                },
                {
                  step: "2",
                  title: (
                    <>
                      Analiza con IA <Novedad />
                    </>
                  ),
                  desc: "Chefcito AI identificará los ingredientes, cantidades y pasos cuando sea posible.",
                },
                {
                  step: "3",
                  title: (
                    <>
                      Opcional * <Novedad />
                    </>
                  ),
                  desc: "Añade o edita los ingredientes detectados si deseas.",
                },
                {
                  step: "4",
                  title: (
                    <>
                      Revisa los resultados <Novedad />
                    </>
                  ),
                  desc: "Obtén una lista organizada de ingredientes y comentarios útiles.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60"
                >
                  <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.title}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ideal para:
            </h4>
            <p className="text-yellow-700 dark:text-yellow-400 text-xs">
              Personas que prefieren mostrar una foto del plato en vez de
              escribir o dictar ingredientes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "compartir",
      title: "Compartir y guardar",
      icon: Share2,
      keywords: [
        "compartir",
        "guardar",
        "favoritos",
        "whatsapp",
        "copiar",
        "descargar",
        "exportar",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Comparte tus recetas
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Desde el menú de cada receta puedes compartir o copiar fácilmente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-sm border border-gray-100/60 dark:border-gray-700/60">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Opciones de compartir <Novedad />
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> Web Share (hoja nativa del
                  dispositivo)
                </li>
                <li className="flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> WhatsApp (app o Web)
                </li>
                <li className="flex items-center gap-2">
                  <Copy className="w-3 h-3" /> Copiar receta en formato legible
                </li>
                <li className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Compartir/descargar{" "}
                  <b>imagen PNG</b> de la tarjeta
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-sm border border-gray-100/60 dark:border-gray-700/60">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Favoritos persistentes <Novedad />
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Agrega o quita favoritos with el
                  corazón
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-3 h-3" /> Requiere sesión para guardar en
                  tu cuenta
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> Mensajes de confirmación
                  (agregado/eliminado)
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Notas
            </h4>
            <ul className="text-green-800 dark:text-green-300 text-xs space-y-2">
              <li>
                Si tu dispositivo no soporta compartir archivos, la imagen se
                descarga automáticamente.
              </li>
              <li>
                Si ves el mensaje de límite (<code>429</code>), espera un
                momento antes de volver a generar.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "analisis",
      title: "Análisis de Recetas",
      icon: BookText,
      keywords: [
        "análisis",
        "analizar",
        "receta",
        "ingredientes",
        "detectar",
        "identificar",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Descubre ingredientes
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Analiza cualquier receta para obtener su lista de ingredientes y
              pasos de preparación.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Cómo funciona:
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Pega la receta
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Copia y pega cualquier receta que encuentres o que tengas
                    guardada.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Analiza con IA
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Identificamos ingredientes, cantidades y pasos cuando sea
                    posible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/60 lg:col-span-2">
                <div className="w-6 h-6 bg-[#FFCB2B] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 shadow-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    Revisa los resultados
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Obtén una lista organizada de ingredientes y comentarios
                    útiles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-yellow-100/80 dark:border-yellow-900/40">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Mejores prácticas
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-400 text-xs space-y-2">
              <li className="flex items-center gap-2">
                <ClipboardList className="w-3 h-3" /> Copia recetas completas
                para mejores resultados
              </li>
              <li className="flex items-center gap-2">
                <Scale className="w-3 h-3" /> Incluye cantidades y medidas
                cuando sea posible
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3 h-3" /> Podemos identificar ingredientes
                regionales
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "preferencias",
      title: "Preferencias y Configuración",
      icon: Shield,
      keywords: [
        "preferencias",
        "configuración",
        "alergias",
        "cocina",
        "país",
        "personalizar",
        "ajustes",
      ],
      content: (
        <div className="space-y-4">
          <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Personaliza tu experiencia
            </h3>
            <p className="text-green-700 dark:text-green-400 text-sm">
              Configura tus preferencias para recomendaciones más precisas y
              seguras.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Alergias Alimentarias
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Registra todas tus alergias para que las recetas las eviten
                automáticamente (maní, lactosa, gluten, mariscos, etc.).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Tipos de Cocina Preferidos
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Selecciona estilos culinarios favoritos. La IA los prioriza
                (también puedes agregar personalizados).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Ubicación
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Indica tu país para recetas con ingredientes locales.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                <Moon className="w-4 h-4" /> Modo Claro/Oscuro
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                Cambia el tema cuando quieras. Recordamos tu elección.
              </p>
            </div>
          </div>

          <div className="bg-green-50/80 dark:bg-green-900/20 backdrop-blur rounded-2xl p-3 mt-4 shadow-sm border border-green-100/80 dark:border-green-900/40">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Tus datos están seguros
            </h4>
            <p className="text-green-700 dark:text-green-400 text-xs">
              Tus preferencias se almacenan de forma segura y solo se usan para
              mejorar tus recetas.
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Navegar a sección anterior/siguiente
  const navigateSection = (direction: "prev" | "next") => {
    const currentIndex = sections.findIndex((s) => s.id === activeSection);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < sections.length) {
      const newSection = sections[newIndex];
      setActiveSection(newSection.id);
      markAsVisited(newSection.id);
    }
  };

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateSection("prev");
      if (e.key === "ArrowRight") navigateSection("next");
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Filtrar secciones por búsqueda
  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(query)
      )
    );
  });

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
  const progressPercentage = (visitedSections.size / sections.length) * 100;

  // Bloquear scroll del cuerpo al abrir el modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isMobile ? 20 : 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className={`flex flex-col overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/70 dark:border-gray-800/80 shadow-[0_24px_70px_rgba(15,23,42,0.25)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.7)] ${
              isMobile
                ? "fixed inset-0 rounded-none"
                : "w-full max-w-[calc(100vw-8rem)] h-[calc(100vh-8rem)] rounded-[2.5rem]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <motion.div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gray-900 text-yellow-200 shadow-lg shadow-yellow-500/40 dark:bg-gray-900 flex-shrink-0"
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.08,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-shrink">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                        Manual de Usuario
                      </h2>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                        Aprende a usar Chefcito AI al máximo
                      </p>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50/80 dark:bg-yellow-900/30 px-3 py-1.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-300">
                          <Sparkles className="w-3 h-3" />
                          <span>Sección {currentSectionIndex + 1}/{sections.length}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                            {Math.round(progressPercentage)}%
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {visitedSections.size}/{sections.length} exploradas
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {isMobile && (
                    <button
                      onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-lg transition-all duration-200"
                    >
                      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Barra de progreso - Solo móvil */}
              {isMobile && (
                <div className="px-4 pb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                      {visitedSections.size}/{sections.length} exploradas
                    </span>
                    <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Barra de progreso visual - Solo desktop */}
              {!isMobile && (
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar */}
              {(!isMobile || showMobileSidebar) && (
                <motion.aside
                  initial={isMobile ? { x: -260, opacity: 0 } : undefined}
                  animate={isMobile ? { x: 0, opacity: 1 } : undefined}
                  exit={isMobile ? { x: -260, opacity: 0 } : undefined}
                  className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl transition-all duration-300 border-r border-gray-200/60 dark:border-gray-700/60 ${
                    isMobile
                      ? "absolute inset-y-0 left-0 w-64 z-40 shadow-2xl"
                      : isSidebarCollapsed
                      ? "w-16"
                      : "w-64"
                  }`}
                >
                  {/* Búsqueda */}
                  {!isSidebarCollapsed && !isMobile && (
                    <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/60">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                      {searchQuery && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {filteredSections.length} resultado
                          {filteredSections.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Búsqueda móvil */}
                  {isMobile && (
                    <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/60">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                      {searchQuery && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {filteredSections.length} resultado
                          {filteredSections.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <nav
                    className={`flex-1 overflow-y-auto space-y-2 ${
                      isSidebarCollapsed ? "p-2" : "p-3 sm:p-4"
                    }`}
                  >
                    {filteredSections.map((section) => {
                      const IconComponent = section.icon;
                      const isActive = activeSection === section.id;
                      const isVisited = visitedSections.has(section.id);

                      return (
                        <motion.button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            markAsVisited(section.id);
                            if (isMobile) setShowMobileSidebar(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 relative ${
                            isActive
                              ? "bg-yellow-50/90 dark:bg-yellow-900/25 text-yellow-800 dark:text-yellow-200 shadow-sm"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50/90 dark:hover:bg-gray-800/60"
                          } ${isSidebarCollapsed ? "justify-center" : ""}`}
                          whileHover={{
                            x: isSidebarCollapsed ? 0 : 4,
                            scale: isSidebarCollapsed ? 1.05 : 1,
                          }}
                          whileTap={{ scale: 0.97 }}
                          title={isSidebarCollapsed ? section.title : ""}
                        >
                          <div className="relative">
                            <IconComponent className="w-5 h-5 flex-shrink-0" />
                            {isVisited && (
                              <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400 absolute -top-1 -right-1" />
                            )}
                          </div>
                          {!isSidebarCollapsed && (
                            <span className="text-sm font-medium flex-1 truncate">
                              {section.title}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>

                  {/* Botón colapsar (desktop) - al final del sidebar */}
                  {!isMobile && (
                    <div className="p-3 border-t border-gray-200/60 dark:border-gray-700/60 flex justify-center">
                      <motion.button
                        onClick={() =>
                          setIsSidebarCollapsed(!isSidebarCollapsed)
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        title={isSidebarCollapsed ? "Expandir" : "Contraer"}
                      >
                        <ChevronLeft
                          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                            isSidebarCollapsed ? "rotate-180" : ""
                          }`}
                        />
                      </motion.button>
                    </div>
                  )}
                </motion.aside>
              )}

              {/* Overlay para cerrar sidebar en móvil (encima del contenido, debajo del sidebar) */}
              {isMobile && showMobileSidebar && (
                <div
                  className="absolute inset-0 bg-black/40 z-30"
                  onClick={() => setShowMobileSidebar(false)}
                />
              )}

              {/* Main */}
              <div className="flex-1 flex flex-col relative z-10">
                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                  <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                      {sections
                        .filter((section) => section.id === activeSection)
                        .map((section) => (
                          <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5 sm:space-y-7"
                          >
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="w-12 h-12 bg-yellow-50/90 dark:bg-yellow-500/10 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-100/80 dark:border-yellow-500/30"
                                whileHover={{
                                  rotate: [0, -8, 8, -8, 0],
                                  scale: 1.05,
                                }}
                                transition={{ duration: 0.4 }}
                              >
                                <section.icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                              </motion.div>
                              <div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                  {section.title}
                                </h3>
                                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  Sección {currentSectionIndex + 1} de{" "}
                                  {sections.length}
                                </p>
                              </div>
                            </div>

                            {section.content}
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Navegación inferior - Fija */}
                <div className="border-t border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                  <div className="max-w-5xl mx-auto px-5 sm:px-7 py-4">
                    <div className="flex items-center justify-between">
                      <motion.button
                        onClick={() => navigateSection("prev")}
                        disabled={currentSectionIndex === 0}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          currentSectionIndex === 0
                            ? "opacity-40 cursor-not-allowed text-gray-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                        }`}
                        whileHover={
                          currentSectionIndex !== 0 ? { x: -4 } : {}
                        }
                        whileTap={
                          currentSectionIndex !== 0
                            ? { scale: 0.96 }
                            : {}
                        }
                        title={!isMobile ? "Usa la flecha ← para ir atrás" : ""}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                      </motion.button>

                      {/* Dots clicables */}
                      <div className="flex items-center gap-2">
                        {sections.map((_, idx) => {
                          const isCurrent = idx === currentSectionIndex;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                const newSection = sections[idx];
                                setActiveSection(newSection.id);
                                markAsVisited(newSection.id);
                              }}
                              className={`h-1.5 rounded-full transition-all ${
                                isCurrent
                                  ? "w-8 bg-yellow-500"
                                  : "w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                              }`}
                              aria-label={`Ir a sección ${idx + 1}`}
                            />
                          );
                        })}
                      </div>

                      <motion.button
                        onClick={() => navigateSection("next")}
                        disabled={
                          currentSectionIndex === sections.length - 1
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          currentSectionIndex === sections.length - 1
                            ? "opacity-40 cursor-not-allowed text-gray-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                        }`}
                        whileHover={
                          currentSectionIndex !== sections.length - 1
                            ? { x: 4 }
                            : {}
                        }
                        whileTap={
                          currentSectionIndex !== sections.length - 1
                            ? { scale: 0.96 }
                            : {}
                        }
                        title={!isMobile ? "Usa la flecha → para avanzar" : ""}
                      >
                        Siguiente
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

