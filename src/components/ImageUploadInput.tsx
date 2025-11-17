// components/ImageUploadInput.tsx
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2, AlertCircle, X, Check } from 'lucide-react';

interface ImageUploadInputProps {
  onImageProcessed: (text: string) => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
}

export default function ImageUploadInput({
  onImageProcessed,
  onError,
  disabled = false,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      const msg = '🚫 La imagen es demasiado grande. Máximo 4MB.';
      setError(msg);
      onError?.(msg);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPendingFile(file);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImage = async () => {
    if (!pendingFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', pendingFile);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      if (!data.text || data.text.trim() === '') {
        throw new Error('No se detectó texto en la imagen. Asegúrate de que sea clara y bien iluminada.');
      }

      onImageProcessed(data.text);
    } catch (err: any) {
      const msg = err.message || 'No se pudo procesar la imagen.';
      setError(msg);
      onError?.(msg);
    } finally {
      setIsUploading(false);
      // La URL se revocará en onLoad del <img>
    }
  };

  const cancelImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingFile(null);
    setError(null);
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-yellow-300/30 to-amber-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            className="relative w-full flex flex-col items-center justify-center gap-2 px-6 py-7 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-yellow-50 dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-yellow-500 text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer"
            style={{ minHeight: 160 }}
          >
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors shadow-md animate-bounce-slow">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              ) : (
                <Camera className="w-8 h-8 text-amber-500 dark:text-amber-400" />
              )}
            </span>
            <span className="text-lg font-bold mt-2">
              {isUploading ? 'Procesando imagen...' : 'Toca para tomar o subir una foto'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isUploading ? 'Extrayendo texto con OCR' : 'Usa la cámara o galería para detectar ingredientes automáticamente'}
            </span>
            <span className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m11 0h-1m-4 0h-1" /></svg>
              ¡Más fácil si apuntas directo a la lista de ingredientes!
            </span>
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Glow detrás del modal */}
          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-yellow-300/20 to-yellow-500/20 rounded-3xl blur-xl" />

          <div className="relative bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span />
                ¿Usar esta foto para detectar ingredientes?
              </span>
              <button
                type="button"
                onClick={cancelImage}
                className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4 rounded-2xl overflow-hidden border-2 border-none dark:border-none shadow-md">
              <img
                src={preview}
                alt="Previsualización"
                className="w-full max-h-72 object-contain bg-gray-50 dark:bg-gray-900 animate-fade-in"
                onLoad={() => URL.revokeObjectURL(preview)}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={confirmImage}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white text-base rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Sí, usar esta foto
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelImage}
                disabled={isUploading}
                className="px-5 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-base rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de privacidad */}
      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="ml-1">Tus fotos <b className="text-green-600 dark:text-green-400 font-semibold">no se guardan</b> en ningún servidor. Solo se usan para extraer texto.</span>
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-base font-semibold animate-shake">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Input oculto */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        capture="environment"
      />
      {/* Animaciones utilitarias */}
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </div>
  );
}