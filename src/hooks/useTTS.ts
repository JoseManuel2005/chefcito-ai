// src/hooks/useTTS.ts

import { useState, useEffect, useRef } from "react";

export const useTTS = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = async (text: string) => {
    if (!text.trim()) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Falló la generación de audio");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Crear o reutilizar elemento de audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setStatus("idle");
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setStatus("idle");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      setStatus("playing");
    } catch (err) {
      console.error("Error en TTS:", err);
      setStatus("idle");
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setStatus("paused");
    }
  };

  const resume = () => {
    if (audioRef.current && status === "paused") {
      audioRef.current.play();
      setStatus("playing");
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus("idle");
    }
  };

  return {
    status,
    speak,
    pause,
    resume,
    stop,
  };
};