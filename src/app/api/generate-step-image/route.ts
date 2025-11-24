// app/api/generate-step-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { stepText } = await req.json(); // 👈 Cambiado de 'prompt' a 'stepText'

    if (!stepText) {
      return NextResponse.json({ error: 'Texto del paso requerido' }, { status: 400 });
    }

    // ✅ Prompt optimizado: ilustración didáctica, estilo manual de cocina
    const prompt = `
Crea una ilustración didáctica y clara del siguiente paso de receta:
"${stepText}"

Requisitos:
- Estilo: ilustración tipo manual de cocina profesional, limpia y funcional.
- Muestra claramente la **acción principal** (cortar, mezclar, hornear) y los **ingredientes/herramientas** involucrados.
- Fondo blanco, sin texto, sin sombras complejas.
- Composición centrada, enfoque en la acción.
- Formato cuadrado (1:1).
- Evita elementos decorativos innecesarios.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview', // 👈 Usa -preview para mejor calidad
      contents: [{ text: prompt }], // 👈 Formato correcto para REST
    });

    const parts: any[] =
      response.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) {
      return NextResponse.json({ error: 'No se generó imagen válida' }, { status: 500 });
    }

    const imageBase64 = imagePart.inlineData.data as string;
    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error('[STEP IMAGE ERROR]', error);
    return NextResponse.json({ error: 'Error al generar ilustración del paso' }, { status: 500 });
  }
}