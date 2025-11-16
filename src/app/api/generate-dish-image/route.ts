// src/app/api/generate-dish-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
      Estilo: imagen fotorrealista de alta calidad, iluminación cálida de estudio,
      fondo desenfocado (bokeh), enfoque nítido en el plato.
      Presentación: servido en plato blanco de cerámica, bien emplatado, sin texto ni logotipos.
      Formato cuadrado tipo 1:1, estilo fotográfico de revista gastronómica.
    `.trim();

    // Llamada a Nano Banana (Gemini 2.5 Flash Image)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        // Forzamos que responda con imagen
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: '1:1', // equivalente a tu 1024x1024
        },
      },
    });

    // La respuesta trae partes; buscamos la que tiene la imagen inline
    // Docs usan `response.parts`, pero según versión puede venir como `candidates[0].content.parts`.
    // Cubrimos ambas formas.
    const parts: any[] =
      // @ts-ignore – el SDK expone `parts` directamente en algunos modos
      response.parts ??
      response.candidates?.[0]?.content?.parts ??
      [];

    const imagePart = parts.find((p) => p.inlineData && p.inlineData.data);

    if (!imagePart) {
      return NextResponse.json(
        { error: 'Nano Banana no devolvió ninguna imagen' },
        { status: 500 }
      );
    }

    const imageBase64 = imagePart.inlineData.data as string;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'La imagen generada no contiene datos válidos' },
        { status: 500 }
      );
    }

    // Mantienes el mismo contrato con el frontend
    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error('[NANO BANANA ERROR]', error);
    const message =
      error?.message || 'Error al generar imagen con Nano Banana (Gemini)';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}