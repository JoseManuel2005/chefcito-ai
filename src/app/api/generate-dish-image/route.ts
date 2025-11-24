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
      Fotografía fotorrealista de alta calidad de un plato de comida llamado "${recipeName}".
      Ingredientes visibles y reconocibles: ${ingredients.join(', ')}.
        
      Contexto:
      - Tipo de plato: ${recipeName.toLowerCase().includes('postre') ? 'postre' : recipeName.toLowerCase().includes('sopa') ? 'sopa' : 'plato principal'}
      - Estilo: comida casera auténtica, no estilizada ni de restaurante de lujo.
      - Presentación: servido en un plato blanco o de cerámica neutra, centrado, sin cubiertos ni manos visibles.
      - Fondo: desenfocado (bokeh suave), textura de madera clara o lienzo neutro.
      - Iluminación: luz natural cálida, sin sombras duras.
      - Calidad: 4K, enfoque nítido en los ingredientes, colores vibrantes pero realistas.
      - Formato: cuadrado (1:1), listo para publicar en redes sociales.
      - Prohibido: texto, logotipos, personas, cubiertos, servilletas, o cualquier elemento que no sea la comida.
        
      Importante: refleja fielmente los ingredientes listados. Si es "bandeja paisa", debe incluir arroz, frijoles, carne, chicharrón, plátano, huevo y aguacate.
      `;

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
      // @ts-expect-error – el SDK expone `parts` directamente en algunos modos
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