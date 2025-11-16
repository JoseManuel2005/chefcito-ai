"use client";

import { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
  /**
   * Número de partículas a renderizar
   * @default 60
   */
  particleCount?: number;
  
  /**
   * Tema actual (para ajustar colores)
   */
  theme?: "light" | "dark";
  
  /**
   * Dependencias adicionales para re-crear partículas
   */
  dependencies?: unknown[];
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

/**
 * Componente de fondo animado con partículas flotantes
 * Renderiza un canvas con partículas que se mueven suavemente
 */
export default function ParticleBackground({
  particleCount = 60,
  theme = "light",
  dependencies = [],
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);

  // Mantener theme actual en un ref para el loop de animación
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const depsKey = JSON.stringify(dependencies);

  useEffect(() => {
    const canvas = canvasRef.current;
    const main = document.querySelector("main");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const width = main?.clientWidth || window.innerWidth;
      const height = main?.scrollHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();

    const particles: Particle[] = [];

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    createParticles();

    let animationId: number;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        const isDark = themeRef.current === "dark";
        ctx.fillStyle = isDark
          ? `rgba(251, 191, 36, ${particle.opacity})`
          : `rgba(251, 191, 36, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resize();
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount, depsKey]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
