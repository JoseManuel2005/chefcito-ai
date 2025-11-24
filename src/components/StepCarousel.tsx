// components/StepCarousel.tsx
'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StepCarouselProps {
  steps: string[];
  images: string[];
}

export default function StepCarousel({ steps, images }: StepCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const onSelect = () => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi]);

  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900 p-4">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {steps.map((paso, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 px-2">
              <div className="text-center py-4 h-full flex flex-col items-center">
                {images[i] ? (
                  <img
                    src={`data:image/png;base64,${images[i]}`}
                    alt={`Paso ${i + 1}: ${paso}`}
                    className="w-48 h-48 mx-auto object-contain rounded-xl border-2 border-amber-200 dark:border-amber-800/50 shadow-md"
                    // 👇 NO usar onLoad para revoke, se hace en el hook
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <span className="text-4xl font-bold text-gray-400 dark:text-gray-600">{i + 1}</span>
                  </div>
                )}
                <p className="text-gray-800 dark:text-gray-200 font-medium text-base mt-2 px-2">{paso}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de navegación */}
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
        aria-label="Paso anterior"
      >
        <ChevronLeft className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
        aria-label="Paso siguiente"
      >
        <ChevronRight className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </button>

      {/* Indicador de progreso */}
      <div className="flex justify-center mt-4 space-x-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === selectedIndex ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}