// src/app/api/tts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

/**
 * Endpoint para convertir texto a voz usando OpenAI TTS.
 * Recibe un JSON con { text: "..." } y devuelve un archivo de audio MP3.
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Texto inválido o vacío." },
        { status: 400 }
      );
    }

    // Limitar longitud para evitar costos excesivos (máx. 1500 caracteres)
    const trimmedText = text.trim().substring(0, 1500);

    // Llamar a OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",        // Más económico
      voice: "nova",         // Voz natural en español
      input: trimmedText,
      response_format: "mp3",
    });

    // Convertir a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Devolver como audio/mp3
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store", // No cachear por privacidad
      },
    });
  } catch (error: any) {
    console.error("Error en /api/tts:", error);
    return NextResponse.json(
      { error: "Error al generar audio." },
      { status: 500 }
    );
  }
}