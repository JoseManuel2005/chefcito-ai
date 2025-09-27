// app/api/recipe/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredients, recipe } = body;

    // MODO 1 → Ingredientes → Recetas
    if (ingredients && Array.isArray(ingredients)) {
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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const rawText = completion.choices[0]?.message?.content ?? "";
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
    }

    // MODO 2 → Receta → Ingredientes
    if (recipe && typeof recipe === "string") {
      const prompt = `Analiza la receta llamada "${recipe}".
Devuelve SOLO un JSON con este formato:
{
  "receta": "...",
  "ingredientes": ["...", "..."],
  "comentario": "Indica si faltan ingredientes comunes que no se mencionaron"
}`;
    
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
    
      const rawText = completion.choices[0]?.message?.content ?? "";
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    
      // 🔍 Intentar extraer JSON válido dentro del texto
      let result;
      try {
        // Busca el primer bloque {...}
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
        } else {
          result = JSON.parse(cleaned);
        }
      } catch {
        result = { receta: "Sin nombre", comentario: cleaned }; // fallback
      }
    
      return NextResponse.json({ analysis: result });
    }


    // Si no se envió ni ingredients ni recipe
    return NextResponse.json(
      { error: "Debes enviar 'ingredients' (array) o 'recipe' (string)" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error en /api/recipe:", error);
    return NextResponse.json(
      { error: "Error al generar respuesta" },
      { status: 500 }
    );
  }
}
