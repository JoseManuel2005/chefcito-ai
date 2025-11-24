'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2, AlertCircle, X, Check } from 'lucide-react';
import ImageTypeSelector from './ImageTypeSelector';

interface ImageUploadInputWithTypeSelectorProps {
  onImageProcessed: (text: string) => void;
  onRawIngredientsDetected: (ingredients: string[], confidence: number) => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
  userPreferences?: any;
}

type ProcessingStep = 'upload' | 'selectType' | 'processing' | 'complete';
type ImageType = 'recipe' | 'ingredients';

export default function ImageUploadInputWithTypeSelector({
  onImageProcessed,
  onRawIngredientsDetected,
  onError,
  disabled = false,
  userPreferences
}: ImageUploadInputWithTypeSelectorProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
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
    setCurrentStep('selectType');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImage = async () => {
    if (!pendingFile) return;
    setCurrentStep('selectType');
  };

  const handleTypeSelection = async (imageType: ImageType) => {
    if (!pendingFile) return;
    
    setCurrentStep('processing');
    setIsUploading(true);

    try {
      if (imageType === 'recipe') {
        // Procesamiento OCR tradicional para recetas
        await processRecipeImage();
      } else {
        // Nuevo procesamiento con IA visual para ingredientes crudos
        await processRawIngredientsImage();
      }
      
      setCurrentStep('complete');
    } catch (err: any) {
      const msg = err.message || 'No se pudo procesar la imagen.';
      setError(msg);
      onError?.(msg);
      setCurrentStep('selectType'); // Volver a selección en caso de error
    } finally {
      setIsUploading(false);
    }
  };

  const processRecipeImage = async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append('image', pendingFile);

    const res = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error en OCR');
    }

    if (!data.text || data.text.trim() === '') {
      throw new Error('No se detectó texto en la imagen. Asegúrate de que la receta sea clara y legible.');
    }

    onImageProcessed(data.text);
  };

  const processRawIngredientsImage = async () => {
    if (!pendingFile) return;

    // Convertir imagen a base64
    const base64 = await fileToBase64(pendingFile);
    
    const res = await fetch('/api/identify-raw-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageBase64: base64,
        userPreferences: userPreferences 
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al identificar ingredientes');
    }

    if (!data.ingredients || data.ingredients.length === 0) {
      throw new Error('No se detectaron ingredientes en la imagen. Intenta con una foto más clara mostrando alimentos sin cocinar.');
    }

    onRawIngredientsDetected(data.ingredients, data.confidence || 0);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remover el prefijo data:image/...;base64,
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const cancelProcess = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingFile(null);
    setError(null);
    setCurrentStep('upload');
    setIsUploading(false);
  };

  const goBackToTypeSelection = () => {
    setError(null);
    setCurrentStep('selectType');
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  // Renderizado condicional basado en el paso actual
  if (currentStep === 'upload') {
    return (
      <div className="space-y-3">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/30 via-yellow-300/30 to-amber-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            className="relative w-full flex flex-col items-center justify-center gap-1.5 px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-yellow-50 dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-yellow-500 text-gray-700 dark:text-gray-200 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
            style={{ minHeight: 120 }}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors shadow-md">
              <Camera className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </span>
            <span className="text-sm font-bold">
              Tomar o subir foto
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Recetas o ingredientes
            </span>
          </button>
        </div>

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

  if (currentStep === 'selectType') {
    return (
      <div className="space-y-4">
        {/* Preview de la imagen */}
        {preview && (
          <div className="relative">
            {/* Glow effect detrás */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-500/20 rounded-xl blur-sm" />
            
            <div className="relative rounded-xl overflow-hidden border-2 border-amber-200/50 dark:border-amber-700/50 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              {/* Header de preview */}
              <div className="px-3 py-2 bg-amber-50/80 dark:bg-amber-900/20 border-b border-amber-200/30 dark:border-amber-700/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2">
                    Vista previa
                  </span>
                </div>
              </div>
              
              {/* Imagen */}
              <div className="p-3">
                <img
                  src={preview}
                  alt="Previsualización"
                  className="w-full max-h-36 sm:max-h-44 object-contain rounded-lg shadow-sm"
                  onLoad={() => URL.revokeObjectURL(preview)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Selector de tipo */}
        <ImageTypeSelector 
          onSelectType={handleTypeSelection}
          onGoBack={cancelProcess}
        />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'processing') {
    return (
      <div className="space-y-4">
        {/* Preview de la imagen durante procesamiento */}
        {preview && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-300/20 to-blue-500/20 rounded-xl blur-sm animate-pulse" />
            
            <div className="relative rounded-xl overflow-hidden border-2 border-blue-200/50 dark:border-blue-700/50 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="px-3 py-2 bg-blue-50/80 dark:bg-blue-900/20 border-b border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200"></div>
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 ml-2">
                    Procesando...
                  </span>
                </div>
              </div>
              
              <div className="p-3 relative">
                <img
                  src={preview}
                  alt="Previsualización"
                  className="w-full max-h-36 sm:max-h-44 object-contain rounded-lg shadow-sm opacity-75"
                />
                {/* Overlay de procesamiento */}
                <div className="absolute inset-3 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg">
                    <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de procesamiento */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
          <div>
            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400">
              Analizando con IA...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // currentStep === 'complete' - este estado se maneja externamente
  return null;
}

// Agregar estilos de animaciones si no existen
const styles = `
  @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
  @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1); }
  @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
  .animate-shake { animation: shake 0.4s; }
`;

if (typeof document !== 'undefined' && !document.getElementById('image-upload-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'image-upload-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}