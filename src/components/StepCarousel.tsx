// components/StepCarousel.tsx
"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface StepCarouselProps {
  steps: string[];
  images: string[];
}

export default function StepCarousel({ steps, images }: StepCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const totalSteps = steps.length;
  const currentStep = selectedIndex + 1;

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
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  if (!steps.length) return null;

  return (
    // 👇 importante: permitir que se estire
    <div className="w-full h-full">
      <div className="relative h-full flex flex-col rounded-3xl border border-gray-200/70 bg-white/90 p-4 sm:p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.7)]">
        {/* Header del carrusel */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paso{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {currentStep}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {totalSteps}
              </span>
            </p>
          </div>

          <div className="hidden text-xs font-medium text-gray-500 dark:text-gray-400 sm:block">
            {Math.round((currentStep / totalSteps) * 100)}% listo
          </div>
        </div>

        {/* Contenedor Embla ocupa todo el espacio entre header y nav */}
        <div className="flex-1 overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex h-full">
            {steps.map((paso, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] min-w-0 px-1 sm:px-2"
              >
                <div className="flex h-full flex-col items-stretch gap-3">
                  {/* Imagen: se expande para llenar el alto disponible */}
                  <div className="relative w-full overflow-hidden rounded-2xl flex-1 flex items-center justify-center">
                    {images[i] ? (
                      <img
                        src={`data:image/png;base64,${images[i]}`}
                        alt={`Paso ${i + 1}: ${paso}`}
                        className="max-h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                          {i + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Texto del paso */}
                  <div className="rounded-2xl bg-gray-50/90 px-3 py-2.5 text-sm leading-relaxed text-gray-800 shadow-inner dark:bg-gray-800/70 dark:text-gray-100">
                    <span className="mr-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
                      Paso {i + 1}
                    </span>
                    <span>{paso}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navegación + dots abajo */}
        <div className="mt-4 flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 dark:text-white font-medium shadow-sm transition hover:border-yellow-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-yellow-500/60 dark:hover:bg-gray-800 cursor-pointer"
              aria-label="Paso anterior"
            >
              <ChevronLeft className="mr-1 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="inline-flex items-center justify-center rounded-full border border-yellow-400 bg-yellow-500/90 px-3 py-1.5 text-sm font-semibold text-white dark:text-gray-800 shadow-md transition hover:bg-yellow-500 dark:hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-yellow-500/80 cursor-pointer"
              aria-label="Paso siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "w-4 bg-yellow-500"
                    : "w-1.5 bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
