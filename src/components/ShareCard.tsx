import React from "react";
import { ChefHat } from "lucide-react";

type Props = {
  title: string;
  time?: string;
  ingredients: string[];
  steps: string[];
};

export default function ShareCard({ title, time, ingredients, steps }: Props) {
  return (
    <div
      id="share-card"
      className="w-[900px] bg-white text-gray-900 flex flex-col justify-between rounded-3xl p-10 shadow-[0_12px_40px_rgba(0,0,0,.12)]"
      style={{
        background:
          "linear-gradient(180deg,#fff, #fff 70%, rgba(255,203,43,.15))",
        maxHeight: "1800px", // límite superior para no generar imágenes gigantes
        minHeight: "600px", // altura mínima estética
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFCB2B] flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-extrabold">Chefcito AI</div>
          </div>
        </div>
        {time && (
          <div className="px-4 py-2 rounded-full bg-black text-white text-lg font-semibold">
            ⏱ {time}
          </div>
        )}
      </div>

      {/* Título */}
      <h1 className="text-4xl font-black leading-snug mb-8">{title}</h1>

      {/* Ingredientes y pasos */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-extrabold mb-3">Ingredientes</h2>
          <ul className="text-base leading-relaxed">
            {ingredients.map((i, idx) => (
              <li key={idx}>• {i}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-extrabold mb-3">Preparación</h2>
          <ol className="text-base leading-relaxed list-decimal pl-5">
            {steps.map((s, idx) => (
              <li key={idx} className="mb-1">
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm mt-auto">
        <div className="text-gray-600">
          Comparte tu receta con <span className="font-bold">#ChefcitoAI</span>
        </div>
        <div className="text-gray-500">chefcito.ai</div>
      </div>
    </div>
  );
}
