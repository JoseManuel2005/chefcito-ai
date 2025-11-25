// src/components/Tooltip.tsx
"use client";

import {
  useState,
  ReactNode,
} from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";

interface TooltipProps {
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
  colorClass?: string;
}

export default function Tooltip({
  content,
  placement = "top",
  children,
  className,
  colorClass,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(8), flip(), shift()],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // ✨ Animación suave: fade in/out
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 160, // ms
    // por defecto ya hace fade, así que no tocamos transform para no pelear con Floating UI
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={className ?? "inline-flex items-center"}
      >
        {children}
      </div>

      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              // estilos de transición (opacity) encima de la posición
              ...transitionStyles,
            }}
            className={`z-50 rounded-md px-2 py-1 text-xs shadow-lg ${
              colorClass ?? "bg-gray-900 text-white"
            }`}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
