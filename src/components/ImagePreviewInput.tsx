// components/ImagePreviewInput.tsx
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface ImagePreviewInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function ImagePreviewInput({
  value,
  onChange,
  disabled = false,
}: ImagePreviewInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Solo depende de `value`
  useEffect(() => {
    // Limpiar la URL anterior ANTES de crear una nueva
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, [value]); // ✅ Solo `value` → ¡no hay bucle!

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          Subir foto del plato
        </button>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Foto seleccionada
            </span>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full"
              aria-label="Quitar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <img
            src={preview}
            alt="Previsualización"
            className="max-h-32 w-auto rounded border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        // capture="environment"
      />
    </div>
  );
}