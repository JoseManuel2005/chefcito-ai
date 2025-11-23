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

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

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
    <div className="relative">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {steps.map((paso, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0 px-2">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center h-full flex flex-col items-center">
                {images[i] ? (
                  <img
                    src={`data:image/png;base64,${images[i]}`}
                    alt={`Paso ${i + 1}`}
                    className="w-24 h-24 mx-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 mb-3"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-bold">{i + 1}</span>
                  </div>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{paso}</p>
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
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Paso anterior"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Paso siguiente"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Indicador de progreso */}
      <div className="flex justify-center mt-3 space-x-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === selectedIndex ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}