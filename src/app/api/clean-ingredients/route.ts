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
    Eres un asistente culinario experto especializado en procesamiento de texto con errores de OCR.
      
    Tu tarea: transformar un bloque de texto crudo (extraído de una foto de ingredientes) en una lista limpia, coherente y realista de ingredientes.
      
    Sigue estas reglas **en orden**:
      
    1. **Limpieza básica**:
       - Elimina líneas vacías, fechas, símbolos, números sueltos, palabras como "vence", "fecha", "kg", "g", etc.
       - Ignora líneas que no contengan al menos una palabra reconocible como ingrediente.
      
    2. **Reconstrucción**:
       - Si ves palabras fragmentadas que claramente pertenecen a un mismo ingrediente (ej. "semillas" en una línea y "limón" en la siguiente), combínalas en uno solo: "semillas de limón".
       - Usa sentido común culinario: "aceite" + "oliva" → "aceite de oliva"; "leche" + "condensada" → "leche condensada".
      
    3. **Normalización**:
       - Usa **singular** y **nombres comunes en español latinoamericano**.
         - "tomates" → "tomate"
         - "cebollas" → "cebolla"
         - "huevos" → "huevo"
       - Corrige abreviaturas comunes:
         - "mz" → "manzana"
         - "pz" → "pizca"
         - "cdta" → "cucharadita"
         - "dds" → "dientes" (de ajo)
      
    4. **Filtrado final**:
       - Elimina duplicados (case-insensitive).
       - No inventes ingredientes que no estén implícitos.
       - Si el resultado es vacío, devuelve [].
      
    Devuelve **SOLO un array JSON válido de strings**, sin explicaciones, sin markdown.
      
    Texto OCR crudo:
    """
    ${rawText}
    """
      
    Salida esperada:
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