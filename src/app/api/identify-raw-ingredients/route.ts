import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = 'nodejs';

/**
 * API para identificar ingredientes sin cocinar en imágenes
 * Utiliza GPT-4 Vision para analizar fotos de despensa/refrigerador
 * y detectar ingredientes crudos disponibles
 */
export async function POST(req: NextRequest) {
  try {
    const { imageBase64, userPreferences } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
    }

    // Construir prompt contextual con preferencias del usuario
    let contextPrompt = `Analiza esta imagen y identifica TODOS los ingredientes alimentarios sin cocinar que puedas ver claramente. 

INSTRUCCIONES IMPORTANTES:
- Solo incluye alimentos/ingredientes que se puedan usar para cocinar
- NO incluyas objetos, envases, recipientes o utensilios
- Usa nombres específicos y comunes en español (ej: "tomate" no "tomate cherry", "cebolla" no "cebolla blanca")
- Si ves múltiples variedades del mismo ingrediente, menciona solo el principal (ej: "tomate" por todos los tipos)
- Incluye carnes, verduras, frutas, huevos, lácteos, granos, especias visibles, etc.
- NO inventes ingredientes que no veas claramente
- Sé conservador: si no estás seguro de un ingrediente, no lo incluyas`;

    // Añadir contexto de preferencias alimentarias si están disponibles
    if (userPreferences) {
      if (userPreferences.dietaryRestrictions?.length > 0) {
        contextPrompt += `\n\nNOTA: El usuario tiene restricciones dietéticas: ${userPreferences.dietaryRestrictions.join(', ')}. Ten esto en cuenta al identificar ingredientes.`;
      }
      if (userPreferences.cuisinePreference) {
        contextPrompt += `\n\nEl usuario prefiere cocina: ${userPreferences.cuisinePreference}. Prioriza ingredientes comunes en esta cocina si los ves.`;
      }
    }

    contextPrompt += `\n\nResponde SOLO con un JSON válido en este formato exacto:
{"ingredients": ["ingrediente1", "ingrediente2", ...], "confidence": número_entre_0_y_1}

Donde confidence indica qué tan seguro estás de la identificación general (0.0 = muy incierto, 1.0 = muy seguro).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: contextPrompt
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.2, // Baja temperatura para respuestas más consistentes
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta del modelo');
    }

    // Extraer JSON (GPT-4 a veces añade ```json...)
    const jsonMatch = content.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Formato de respuesta inválido');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validar estructura de respuesta
    if (!result.ingredients || !Array.isArray(result.ingredients)) {
      throw new Error('Estructura de ingredientes inválida');
    }

    // Filtrar y limpiar ingredientes
    const cleanIngredients = result.ingredients
      .filter((ing: string) => typeof ing === 'string' && ing.trim().length > 1)
      .map((ing: string) => ing.trim().toLowerCase())
      .filter((ing: string, index: number, arr: string[]) => arr.indexOf(ing) === index) // Eliminar duplicados
      .slice(0, 15); // Limitar a máximo 15 ingredientes para evitar spam

    // Asegurar que confidence esté en rango válido
    const confidence = Math.max(0, Math.min(1, result.confidence || 0));

    return NextResponse.json({
      ingredients: cleanIngredients,
      confidence: confidence,
      detectionType: 'raw-ingredients'
    });

  } catch (error: any) {
    console.error('[IDENTIFY-RAW-INGREDIENTS ERROR]', error);
    
    // Respuestas de error más específicas
    if (error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Error al procesar la respuesta del análisis de imagen. Intenta con una imagen más clara.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'No se pudieron identificar ingredientes en la imagen. Asegúrate de que sea una foto clara de alimentos sin cocinar.' },
      { status: 500 }
    );
  }
}