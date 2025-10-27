// src/hooks/useMenuToggle.ts
import { useState, useEffect } from "react";

/**
 * Hook para manejar el estado de menús desplegables con cierre al hacer click fuera
 */
export function useMenuToggle(menuId: string | null) {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuIndex === null) return;

    const handler = (e: MouseEvent) => {
      const el = document.getElementById(`${menuId}-${openMenuIndex}`);
      if (!el) return setOpenMenuIndex(null);
      if (!el.contains(e.target as Node)) setOpenMenuIndex(null);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuIndex, menuId]);

  return { openMenuIndex, setOpenMenuIndex };
}
