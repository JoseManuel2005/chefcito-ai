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
      const msg = 'La imagen es demasiado grande. Máximo 4MB.';
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
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled || isUploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {isUploading ? 'Procesando...' : '📸 Subir foto de ingredientes'}
        </button>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ¿Usar esta foto?
            </span>
            <button
              type="button"
              onClick={cancelImage}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <img
            src={preview}
            alt="Previsualización"
            className="max-h-32 w-auto rounded border border-gray-200 dark:border-gray-700 mb-3"
            onLoad={() => URL.revokeObjectURL(preview)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmImage}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white text-sm rounded font-medium"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isUploading ? 'Procesando...' : 'Sí, usar esta foto'}
            </button>
            <button
              type="button"
              onClick={cancelImage}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm rounded font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de privacidad */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tus fotos no se guardan en ningún servidor. Solo se usan para extraer texto.
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
    </div>
  );
}