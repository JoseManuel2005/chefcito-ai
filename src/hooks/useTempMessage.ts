// src/hooks/useTempMessage.ts
import { useState, useCallback } from "react";

type MessageType = "error" | "success";

/**
 * Hook para manejar mensajes temporales (toasts)
 */
export function useTempMessage() {
  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [tempMessageType, setTempMessageType] = useState<MessageType>("success");

  const showMessage = useCallback((message: string, type: MessageType = "success", duration = 2500) => {
    setTempMessage(message);
    setTempMessageType(type);
    setTimeout(() => setTempMessage(null), duration);
  }, []);

  const showError = useCallback((message: string, duration = 2500) => {
    showMessage(message, "error", duration);
  }, [showMessage]);

  const showSuccess = useCallback((message: string, duration = 2500) => {
    showMessage(message, "success", duration);
  }, [showMessage]);

  return {
    tempMessage,
    tempMessageType,
    showMessage,
    showError,
    showSuccess,
  };
}
