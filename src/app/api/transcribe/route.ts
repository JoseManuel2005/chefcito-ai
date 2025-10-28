// src/app/api/transcribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai"; // Asumiendo que ya tienes esta configuración

/**
 * Endpoint para transcribir audio usando la API de Whisper de OpenAI.
 * Espera una solicitud POST con un archivo de audio en el campo 'audio'.
 */
export async function POST(req: NextRequest) {
  try {
    // Obtener el FormData de la solicitud
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Archivo de audio no proporcionado o inválido." },
        { status: 400 }
      );
    }

    // Convertir el Blob a un Buffer (requerido por la API de OpenAI)
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Crear un objeto File-like para pasar a OpenAI
    const file = new File([buffer], "audio.webm", { type: "audio/webm" });

    // Llamar a la API de Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "es", // Fuerza español para mayor precisión en tu audiencia
      response_format: "json", // Puedes usar "text" si solo quieres el string
    });

    // Devolver el texto transcrito
    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Error en /api/transcribe:", error);
    return NextResponse.json(
      { error: "Error al transcribir el audio." },
      { status: 500 }
    );
  }
}