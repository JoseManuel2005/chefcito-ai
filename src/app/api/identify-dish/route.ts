import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
	  model: 'gpt-4o-mini',
	  messages: [
	    {
	      role: 'user',
	      content: [
	        {
	          type: 'text',
	          text: `Analiza esta imagen y determina si representa un PLATO DE COMIDA ya preparado y servido (como bandeja paisa, ajiaco, arroz con pollo, ramen, etc.), o si solo muestra INGREDIENTES sueltos (como huevos, leche, cebolla en la nevera), o una receta escrita.
			
	Sigue estas reglas estrictamente:
	- Si hay un plato claramente preparado y servido (con presentación de comida lista para comer), responde con el NOMBRE DEL PLATO EN ESPAÑOL (ej. "bandeja paisa", "ajiaco bogotano", "sancocho de gallina", "ceviche de pescado").
	- Si la imagen solo muestra ingredientes sin preparar, responde con: {"dishName": null, "confidence": 0.0}
	- Si la imagen es ambigua o no se distingue claramente un plato, responde con un confidence bajo (<0.5).
	- Usa nombres de platos reales y comunes en LATINOAMÉRICA, especialmente COLOMBIA si aplica.
	- No inventes nombres. Si no reconoces el plato, usa un nombre genérico como "guiso de carne" solo si es evidente.
			
	Responde SOLO con un JSON estricto: {"dishName": "nombre" | null, "confidence": número_entre_0_y_1}`
	        },
	        {
	          type: 'image_url',
	          image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
	        }
	      ]
	    }
	  ],
	  max_tokens: 100,
	  temperature: 0.3,
	});

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Sin respuesta de GPT-4o.mini');

    // Extraer JSON (GPT-4o a veces añade ```json...)
    const jsonMatch = content.match(/{.*}/);
    if (!jsonMatch) throw new Error('Formato inválido');

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[IDENTIFY-DISH ERROR]', error);
    return NextResponse.json(
      { error: 'No se pudo identificar el plato. Prueba con una imagen más clara.' },
      { status: 500 }
    );
  }
}