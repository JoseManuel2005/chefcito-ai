// src/app/api/clean-ingredients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'Texto crudo requerido' }, { status: 400 });
    }

    const prompt = `
Eres un asistente culinario experto. Tu tarea es recibir un bloque de texto extraído de una lista de ingredientes (posiblemente con errores de OCR, saltos de línea incorrectos o palabras fragmentadas) y devolver una lista limpia, coherente y realista de ingredientes.

Instrucciones:
- Combina palabras relacionadas que estén separadas (ej. "semillas" y "limón" → "semillas de limón").
- Elimina palabras sueltas que no sean ingredientes (ej. "fecha", "vence", números sueltos, símbolos).
- Normaliza a singular y formato estándar (ej. "cebollas" → "cebolla", "tomates" → "tomate").
- No inventes ingredientes que no estén implícitos en el texto.
- Devuelve SOLO un array JSON de strings. Nada más.

Texto OCR crudo:
"""
${rawText}
"""

Respuesta esperada (solo JSON válido):
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // económico y rápido
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0].message.content?.trim() || '[]';

    // Limpiar y parsear JSON (puede tener markdown en modo debug)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```|(\[.*\])/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

    let ingredients: string[];
    try {
      ingredients = JSON.parse(jsonString);
      if (!Array.isArray(ingredients)) throw new Error('Not an array');
    } catch (e) {
      // Fallback: extraer líneas no vacías si JSON falla
      ingredients = content
        .split('\n')
        .map(s => s.trim().replace(/^- /, '').replace(/"/g, ''))
        .filter(s => s.length > 2 && /^[a-záéíóúñ\s]+$/i.test(s));
    }

    // Filtrar duplicados y vacíos
    const unique = Array.from(new Set(ingredients.map(i => i.toLowerCase().trim())))
      .filter(i => i.length > 1);

    return NextResponse.json({ ingredients: unique });
  } catch (error: any) {
    console.error('[CLEAN INGREDIENTS ERROR]', error);
    return NextResponse.json(
      { error: 'No se pudo limpiar la lista de ingredientes' },
      { status: 500 }
    );
  }
}