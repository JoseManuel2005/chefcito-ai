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
	  model: 'gpt-4o-mini', // {"dishName": "nombre" | null, "confidence": número_entre_0_y_1}`
	  messages: [
	    {
	      role: 'user',
	      content: [
	        {
	          type: 'text',
	          text: `Eres un experto en gastronomía global con enfoque en **cocina latinoamericana**, especialmente **colombiana**.

				Analiza esta imagen y determina si representa un **PLATO DE COMIDA ya preparado, ensamblado y listo para servir** (como bandeja paisa, ajiaco, carne asada, milanesa, ceviche, arroz con pollo, sancocho, etc.), o si muestra **ingredientes sueltos**, **una receta escrita**, o **algo no comestible**.
							
				Sigue estas reglas **estrictamente y en orden**:
							
				1. **Plato válido**:
				   - Debe estar **cocinado, ensamblado y presentado como comida lista para comer**.
				   - Debe ser un plato **real, comestible y común** en América Latina o cocina internacional básica.
				   - Ejemplos válidos: "bandeja paisa", "ajiaco", "carne asada", "milanesa con papas", "ceviche", "sopa de fideos".
							
				2. **NO es un plato** (responde con: {"dishName": null, "confidence": 0.0}):
				   - Ingredientes sueltos en nevera, bolsa o mesa (ej. huevos, leche, cebolla).
				   - Receta escrita, libro, foto de receta impresa.
				   - Imagen borrosa, comida no identificable, o sin contenido culinario claro.
							
				3. **Salida**:
				   - Si es un plato válido: devuelve su **nombre en español**, breve, común y realista (ej. "ajiaco", no "sopa de pollo con guascas").
				   - Si hay duda razonable (ej. solo se ve una porción sin contexto): **confidence ≤ 0.5**.
				   - **Nunca inventes**. Si no estás seguro, y no hay evidencia clara, **no adivines**.
							
				4. **Formato de respuesta**:
				   - Devuelve **SOLO un JSON válido**, sin texto adicional, sin markdown, sin explicaciones.
				   - Estructura: {"dishName": "nombre_en_español" | null, "confidence": número_entre_0_y_1}
							
				Ejemplos de salida correcta:
				- {"dishName": "bandeja paisa", "confidence": 0.95}
				- {"dishName": "milanesa", "confidence": 0.85}
				- {"dishName": null, "confidence": 0.0}
				- {"dishName": "guiso de carne", "confidence": 0.6}
				`
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