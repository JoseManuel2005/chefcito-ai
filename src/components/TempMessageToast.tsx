// src/components/TempMessageToast.tsx
import React from "react";

interface TempMessageToastProps {
  message: string | null;
  type: "error" | "success";
}

/**
 * Componente para mostrar mensajes temporales (toasts)
 */
export default function TempMessageToast({ message, type }: TempMessageToastProps) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === "error"
          ? "bg-red-500 text-white dark:bg-red-600"
          : "bg-green-500 text-white dark:bg-green-600"
      }`}
    >
      {message}
    </div>
  );
}
