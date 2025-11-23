// app/api/generate-step-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '1:1' },
      },
    });

    const parts: any[] =
      // @ts-expect-error - response typings don't include 'parts' for image modality responses
      response.parts ??
      response.candidates?.[0]?.content?.parts ??
      [];

    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart) {
      return NextResponse.json({ error: 'No se generó imagen' }, { status: 500 });
    }

    const imageBase64 = imagePart.inlineData.data as string;
    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error('[STEP IMAGE ERROR]', error);
    return NextResponse.json({ error: 'Error al generar mini-ilustración' }, { status: 500 });
  }
}