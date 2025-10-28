// src/utils/shareUtils.ts
import * as htmlToImage from "html-to-image";

/**
 * Formatea una receta en texto plano para compartir
 */
export function formatRecipeForText(recipe: any, index?: number): string {
  const title = recipe?.nombre || recipe?.receta || (typeof index === "number" ? `Receta ${index + 1}` : "Receta");
  const time = recipe?.tiempo ? `⏱ ${recipe.tiempo}\n` : "";
  const ingredientes = (recipe?.ingredientes || [])
    .map((i: string) => `• ${i}`)
    .join("\n");
  const pasos = (recipe?.pasos || [])
    .map((p: string, i: number) => `${i + 1}. ${p}`)
    .join("\n");

  return `*${title}*\n${time}\n*Ingredientes:*\n${ingredientes || "• —"}\n\n*Preparación:*\n${pasos || "—"}`;
}

/**
 * Copia texto al portapapeles con fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Abre WhatsApp Desktop si existe; si no, cae a WhatsApp Web
 */
export function shareViaWhatsAppDesktopOrWeb(text: string): void {
  const encoded = encodeURIComponent(text);

  try {
    window.open(`whatsapp://send?text=${encoded}`, "_blank");
  } catch {
    /* noop */
  }

  // Fallback a Web si no se pudo abrir Desktop
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    }
  }, 900);
}

/**
 * Comparte de forma inteligente usando Web Share API o WhatsApp
 */
export async function shareSmart(text: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  shareViaWhatsAppDesktopOrWeb(text);
  return true;
}

/**
 * Crea una imagen PNG desde un elemento HTML
 */
export async function renderShareCardPNG(el: HTMLElement): Promise<Blob> {
  const dataUrl = await htmlToImage.toPng(el, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
    quality: 1,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}

/**
 * Verifica si el navegador soporta compartir archivos
 */
export function supportsFileShare(): boolean {
  return !!(
    navigator.canShare &&
    navigator.canShare({
      files: [new File(["x"], "x.png", { type: "image/png" })],
    })
  );
}

/**
 * Comparte receta como imagen usando ShareCard
 */
export async function shareRecipeAsImage(
  recipe: any,
  index: number,
  onSuccess: (message: string) => void,
  onError: (message: string) => void
): Promise<void> {
  // Montamos ShareCard temporalmente
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-99999px";
  document.body.appendChild(mount);

  const ingredients = (recipe.ingredientes || []) as string[];
  const steps = (recipe.pasos || []) as string[];

  try {
    const { createRoot } = await import("react-dom/client");
    const { default: ShareCard } = await import("@/components/ShareCard");
    
    const root = createRoot(mount);
    root.render(
      ShareCard({
        title: recipe.nombre || recipe.receta || `Receta ${index + 1}`,
        time: recipe.tiempo || "",
        ingredients: ingredients,
        steps: steps,
      })
    );

    await new Promise((r) => setTimeout(r, 50));
    const cardEl = mount.querySelector("#share-card") as HTMLElement;

    const blob = await renderShareCardPNG(cardEl);
    const fileName = `${recipe.nombre || recipe.receta || `receta-${index + 1}`}.png`;
    const file = new File([blob], fileName, { type: "image/png" });
    const caption = `Chefcito AI — ${recipe.nombre || recipe.receta || `Receta ${index + 1}`}`;

    if (supportsFileShare()) {
      await navigator.share({
        files: [file],
        text: caption,
        title: recipe.nombre || recipe.receta || `Receta ${index + 1}`,
      });
      onSuccess("Compartiendo imagen…");
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      onSuccess("Imagen descargada. ¡Lista para compartir!");
    }

    root.unmount();
  } catch (e) {
    console.error(e);
    onError("No se pudo generar la imagen");
  } finally {
    document.body.removeChild(mount);
  }
}
