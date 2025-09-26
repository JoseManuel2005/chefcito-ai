// app/api/recipe/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { ingredients } = await req.json();

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Se requiere un array de ingredientes" },
        { status: 400 }
      );
    }

    // Prompt básico para probar
    const prompt = `Genera 2 recetas cortas usando estos ingredientes: ${ingredients.join(", ")}.
Devuelve la respuesta en JSON con este formato:
[
  {
    "nombre": "...",
    "ingredientes": ["...", "..."],
    "pasos": ["...", "..."]
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ligero y económico para pruebas
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    // 1. quitar bloque de ```json ... ```
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    let recipes;
    try {
      recipes = JSON.parse(cleaned);
    } catch {
      recipes = cleaned; // fallback
    }
    

    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error("Error en /api/recipe:", error);
    return NextResponse.json(
      { error: "Error al generar receta" },
      { status: 500 }
    );
  }
}
