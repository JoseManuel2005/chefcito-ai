// components/ImageUploadInput.tsx
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (HU-12)
    if (file.size > 4 * 1024 * 1024) {
      const msg = 'La imagen es demasiado grande. Máximo 4MB.';
      setError(msg);
      onError?.(msg);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
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

      {/* Mensaje de privacidad (HU-13) */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tus fotos no se guardan en ningún servidor. Solo se usan para extraer texto.
      </p>

      {/* Previsualización (HU-11) */}
      {preview && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Vista previa:</p>
          <img
            src={preview}
            alt="Previsualización"
            className="max-h-32 w-auto rounded border border-gray-200 dark:border-gray-700"
            onLoad={() => URL.revokeObjectURL(preview)}
          />
        </div>
      )}

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
        capture="environment" // prioriza cámara en móvil
      />
    </div>
  );
}