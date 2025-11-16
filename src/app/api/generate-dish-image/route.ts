// src/app/api/generate-dish-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { recipeName, ingredients } = await req.json();

    if (!recipeName || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Nombre de receta e ingredientes requeridos' },
        { status: 400 }
      );
    }

    const prompt = `
      Fotografía profesional de un plato de comida llamado "${recipeName}".
      Ingredientes visibles: ${ingredients.join(', ')}.
      Estilo: imagen fotorrealista de alta calidad, iluminación cálida de estudio, fondo desenfocado (bokeh), enfoque nítido en el plato.
      Presentación: el plato está servido en un plato blanco de cerámica, bien emplatado, sin texto ni logotipos.
      Resolución: 1024x1024, estilo fotográfico de revista gastronómica.
    `.trim();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    // ✅ Validación segura para TypeScript
    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'No se devolvió ninguna imagen desde DALL·E' },
        { status: 500 }
      );
    }

    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'La imagen generada no contiene datos válidos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error('[DALL·E ERROR]', error);
    const message = error.message || 'Error al generar imagen con DALL·E';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}