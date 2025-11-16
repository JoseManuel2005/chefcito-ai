"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Sparkles, ArrowRight, Camera, Target, Zap, Headphones } from "lucide-react";
import ChiefLogo from "@/components/ChiefLogo";
import { useTheme } from "@/contexts/ThemeContext";
import GoogleSignInButton from "@/components/GoogleSiginButton";
import ParticleBackground from "@/components/ParticleBackground";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme(); // usamos el contexto global
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        theme === "dark"
          ? "dark bg-gray-950"
          : "bg-white"
      }`}
    >
      {/* Canvas de partículas */}
      <ParticleBackground theme={theme} />

      {/* Toggle de tema */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-4 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 z-50 hover:scale-110 group border border-white/60 dark:border-gray-700"
        aria-label={`Cambiar a modo ${
          theme === "light" ? "oscuro" : "claro"
        }`}
      >
        {theme === "light" ? (
          <Moon className="w-6 h-6 text-gray-800 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
        )}
      </button>

      {/* Contenedor principal */}
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Sección izquierda - Hero */}
        <section className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-16">
          {/* Burbujas 3D */}
          {/* <div
            className="pointer-events-none absolute top-20 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-3xl opacity-30"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${
                mousePosition.y * 0.02
              }px)`,
              transition: "transform 0.3s ease-out",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-20 right-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-red-500 blur-3xl opacity-25"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${
                mousePosition.y * -0.015
              }px)`,
              transition: "transform 0.3s ease-out",
            }}
          /> */}

          <div className="relative z-10 max-w-xl space-y-8 text-center lg:text-left">
            {/* Logo + título */}
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <div className="bg-yellow-500 p-4 rounded-3xl shadow-2xl hover:scale-110 hover:rotate-6 transition-transform duration-300">
                <ChiefLogo className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-5xl lg:text-6xl font-black bg-yellow-400 bg-clip-text text-transparent">
                  Chefcito AI
                </h1>
              </div>
            </div>

            {/* Texto principal */}
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                Tu asistente culinario
                <span className="mt-2 block bg-yellow-400 bg-clip-text text-transparent">
                  inteligente
                </span>
              </h2>
              <p className="text-lg lg:text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                Sube una foto de tu nevera, habla con Chefcito y recibe recetas
                rápidas, balanceadas y pensadas para tu familia. Menos estrés,
                más momentos alrededor de la mesa.
              </p>
            </div>

            {/* Features pills */}
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
              {[
                { icon: Camera, text: "Recetas con lo que ves" },
                { icon: Target, text: "Basadas en tus gustos" },
                { icon: Zap, text: "Listas en minutos" },
                { icon: Headphones, text: "Guías por voz" },
              ].map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-gray-800 shadow-md backdrop-blur dark:bg-gray-900/70 dark:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl"
                  >
                    <IconComponent className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sección derecha - Login */}
        <section className="relative flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
          {/* Glow detrás de la tarjeta */}
          <div className="pointer-events-none absolute inset-x-10 top-24 hidden h-72 rounded-[50px] bg-white/25 shadow-[0_0_80px_rgba(255,255,255,0.5)] blur-3xl dark:bg-yellow-700/25 lg:block" />

          {/* Card de login “moderna” */}
          <div
            className="relative w-full max-w-md rounded-[2.5rem] border border-white/60 bg-white/90 p-10 lg:p-12 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] transition-all duration-500 hover:shadow-[0_32px_90px_rgba(15,23,42,0.3)]"
            style={{
              transform: `perspective(1100px) rotateY(${
                (mousePosition.x - window.innerWidth / 2) * -0.01
              }deg) rotateX(${
                (mousePosition.y - window.innerHeight / 2) * 0.01
              }deg)`,
              transition: "transform 0.25s ease-out, box-shadow 0.4s",
            }}
          >
            {/* Badge superior */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-70" />
                <div className="relative flex h-12 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white px-6 gap-2 shadow-lg whitespace-nowrap">
                  <Sparkles className="h-3 w-3 text-yellow-300 flex-shrink-0" />
                  <span>Versión final · Ya disponible</span>
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="mt-4 space-y-2 text-center">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                ¡Bienvenido!
              </h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                Inicia sesión y deja que Chefcito piense por ti en la cocina.
              </p>
            </div>

            {/* Botón de Google (usa tu componente REAL) */}
            <div className="mt-8 space-y-6">
              {/* Si tu GoogleSignInButton acepta className, pásalo así: */}
              <GoogleSignInButton />

              {/* Separador + botón invitado */}
              {/* <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/90 px-3 text-gray-500 dark:bg-gray-900/95 dark:text-gray-400">
                    o pruébalo como invitado
                  </span>
                </div>
              </div>

              <button className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900/90 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-2xl">
                <span>Continuar sin cuenta</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button> */}
            </div>

            {/* Texto legal */}
            <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Al continuar, aceptas nuestros Términos y la Política de
              Privacidad. Si es tu primera vez, crearemos tu cuenta
              automáticamente con tu correo de Google.
            </p>
          </div>
        </section>
      </div>

      {/* Línea inferior de acento */}
      {/* <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" /> */}
    </main>
  );
}
