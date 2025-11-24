// app/api/recipe/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

// 🔒 RATE LIMITING (solo para MVP - en memoria)
// En producción, se debe usar Redis o una base de datos externa.
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 5; // máximo 5 peticiones por minuto
const WINDOW_MS = 60 * 1000; // 1 minuto

/**
 * Obtiene la dirección IP real del cliente desde los headers.
 * Prioriza 'x-forwarded-for' (usado por proxies/CDNs) y cae a localhost si no está disponible.
 */
function getIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
}

/**
 * Verifica si un ingrediente contiene o coincide parcialmente con alguna alergia declarada.
 * Realiza comparación insensible a mayúsculas/minúsculas y bidireccional (ingrediente ⊆ alergia o viceversa).
 * @param ingredient Nombre del ingrediente a verificar.
 * @param allergies Lista de alergias del usuario.
 * @returns true si hay coincidencia potencial de alergia.
 */
function isAllergen(ingredient: string, allergies: string[]): boolean {
  const ingLower = ingredient.toLowerCase();
  return allergies.some(allergy => {
    const allergyLower = allergy.toLowerCase();
    return ingLower.includes(allergyLower) || allergyLower.includes(ingLower);
  });
}

/**
 * Maneja solicitudes POST para generar recetas o analizar recetas existentes.
 * Soporta dos modos:
 *   1. ingredients → recetas (reducción de desperdicio + alergias + preferencias)
 *   2. recipe → ingredientes (análisis con contexto del usuario)
 */
export async function POST(req: Request) {
  // --- RATE LIMITING AL INICIO DE LA FUNCIÓN ---
  const ip = getIP(req);
  const now = Date.now();

  // Limpieza opcional (cada 10 peticiones): elimina entradas expiradas del mapa.
  // Esto evita que el mapa crezca indefinidamente en memoria durante el MVP.
  if (Math.random() < 0.1) {
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) requestCounts.delete(key);
    }
  }

  let ipData = requestCounts.get(ip);
  if (!ipData) {
    ipData = { count: 0, resetTime: now + WINDOW_MS };
    requestCounts.set(ip, ipData);
  }

  // Reinicia el contador si la ventana de tiempo ha expirado.
  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + WINDOW_MS;
  }

  // Bloquea la solicitud si se excede el límite de peticiones.
  if (ipData.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Por favor, espera 1 minuto." },
      { status: 429 }
    );
  }

  ipData.count++;

  try {
    const body = await req.json();
    const { ingredients, recipe, userPreferences } = body;

    // Extraer preferencias del usuario con validación y valores por defecto seguros.
    const allergies = userPreferences?.allergies?.filter((a: any) => typeof a === 'string' && a.trim() !== '') || [];
    const preferredCuisines = userPreferences?.preferredCuisines?.filter((c: any) => typeof c === 'string' && c.trim() !== '') || [];
    const country = (typeof userPreferences?.country === 'string' ? userPreferences.country.trim() : '') || '';

    // === MODO 1: Ingredientes → Recetas ===
    if (ingredients && Array.isArray(ingredients)) {
      // Filtra ingredientes válidos: deben tener una propiedad 'name' no vacía.
      const validIngredients = ingredients
        .filter(ing => ing && typeof ing.name === 'string' && ing.name.trim() !== '');

      if (validIngredients.length === 0) {
        return NextResponse.json(
          { error: "La lista de ingredientes no puede estar vacía" },
          { status: 400 }
        );
      }

      // Normaliza la fecha actual a medianoche para comparar con fechas de vencimiento.
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const expiringSoon: string[] = [];
      const others: string[] = [];
      const expired: string[] = [];

      // Clasifica ingredientes según su fecha de vencimiento.
      for (const ing of validIngredients) {
        const name = ing.name.trim();
        const expiry = ing.expiry;

        if (expiry) {
          const expiryDate = new Date(expiry);
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            expired.push(name);
          } else if (diffDays <= 2) {
            expiringSoon.push(name);
          } else {
            others.push(name);
          }
        } else {
          others.push(name);
        }
      }

      const usableIngredients = [...expiringSoon, ...others];
      const hasUsable = usableIngredients.length > 0;
      const hasExpired = expired.length > 0;

      let warning = "";
      if (hasExpired) {
        warning = `Los siguientes ingredientes están vencidos y no se recomienda usarlos por seguridad: ${expired.join(", ")}.`;
      }

      if (!hasUsable) {
        return NextResponse.json({
          recipes: [],
          warning: warning || "No hay ingredientes válidos para generar recetas."
        });
      }

      // Verifica si todos los ingredientes útiles son alérgenos para el usuario.
      if (allergies.length > 0) {
        const safeIngredients = usableIngredients.filter(ing => !isAllergen(ing, allergies));
        
        if (safeIngredients.length === 0) {
          const allergyWarning = `⚠️ No se pueden generar recetas porque todos tus ingredientes (${usableIngredients.join(", ")}) están relacionados con tus alergias (${allergies.join(", ")}). Por favor, agrega ingredientes seguros.`;
          return NextResponse.json({
            recipes: [],
            warning: warning ? `${warning} ${allergyWarning}` : allergyWarning
          });
        }
      }

      // === Construir contexto del usuario para el prompt ===
      let userContext = "";

      if (allergies.length > 0) {
        userContext += `Evita estrictamente los siguientes alérgenos: ${allergies.join(", ")}. `;
      }

      if (preferredCuisines.length > 0) {
        userContext += `Prefiere recetas de los siguientes tipos de cocina: ${preferredCuisines.join(", ")}. `;
      }

      if (country) {
        userContext += `El usuario está en ${country}, así que prioriza ingredientes, técnicas y platos comunes en esa región. `;
      }

      if (!userContext) {
        userContext = "No hay preferencias específicas del usuario. ";
      }

      // Filtrar ingredientes seguros (sin alergias) para el prompt.
      const safeExpiringSoon = allergies.length > 0 
        ? expiringSoon.filter(ing => !isAllergen(ing, allergies))
        : expiringSoon;
      const safeOthers = allergies.length > 0 
        ? others.filter(ing => !isAllergen(ing, allergies))
        : others;

      // === Prompt final para generación de recetas ===
      const prompt = `Eres un chef experto comprometido con la seguridad alimentaria y la reducción del desperdicio.
Sigue estas reglas estrictamente:
- ${allergies.length > 0 ? `NUNCA uses, sugieras ni menciones ninguno de estos alérgenos: ${allergies.join(", ")}.` : "No hay alergias reportadas."}
- ${preferredCuisines.length > 0 ? `Prioriza recetas inspiradas en: ${preferredCuisines.join(", ")}.` : "Sin preferencias culinarias específicas."}
- ${country ? `El usuario está en ${country}. Usa ingredientes accesibles y platos tradicionales o populares allí.` : "Ubicación no especificada."}

ANTES DE GENERAR RECETAS:
1. Filtra los ingredientes y conserva SOLO aquellos que sean comestibles, reales y seguros para consumo humano.
2. Ignora completamente ingredientes no comestibles como: piedra, lapiz, plastico, metal, papel, noingrediente, etc.
3. Si después del filtrado no quedan ingredientes válidos, devuelve un array vacío [].
4. Si por ejemplo introduce "piedra" y luego "pollo" (ingrediente real), olvida "piedra" y usa los ingredientes que si son comestibles.

Ingredientes disponibles para usar (todos están en buen estado):
- 🚨 Ingredientes que vencen HOY o en los próximos 2 días (¡usa estos primero!): ${safeExpiringSoon.length > 0 ? safeExpiringSoon.join(", ") : "Ninguno"}
- ✅ Otros ingredientes frescos: ${safeOthers.length > 0 ? safeOthers.join(", ") : "Ninguno"}

Genera hasta 2 recetas cortas, realistas, seguras y deliciosas usando SOLO los ingredientes disponibles.
Puedes usar solo un ingrediente si es necesario.
Cada receta debe tener **entre 4 y 6 pasos**, secuenciales y prácticos.
Los pasos deben ser **claros, detallados y realistas** (ej: "Pica la cebolla en juliana fina", no "Prepara los ingredientes").
Para cada receta, estima un tiempo de preparación REALISTA en minutos (ej: "15-20 minutos", "45-60 minutos").
Si no es posible crear recetas útiles, devuelve un array vacío [].

Devuelve SOLO un JSON en este formato exacto (sin texto adicional, sin markdown):
[
  {
    "nombre": "Nombre de la receta",
    "ingredientes": ["Ingrediente 1", "Ingrediente 2", ...],
    "pasos": ["Paso 1", "Paso 2", ...],
    "tiempo": "25-30 minutos"
  }
]`;

      // Llamada a OpenAI para generar recetas.
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Limpieza del contenido de la respuesta para extraer JSON puro.
      const rawText = completion.choices[0]?.message?.content ?? "";
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let recipes = [];
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          recipes = parsed;
        }
      } catch (e) {
        console.warn("Fallo al parsear JSON de recetas:", cleaned);
        recipes = [];
      }

      return NextResponse.json({ recipes, warning });
    }

    // === MODO 2: Receta → Ingredientes (CON preferencias del usuario) ===
    if (recipe && typeof recipe === "string") {
      // Construir contexto del usuario para el análisis
      let userContext = "";

      if (allergies.length > 0) {
        userContext += `El usuario tiene alergias a: ${allergies.join(", ")}. NO incluyas ni sugieras ingredientes que contengan estos alérgenos. `;
      }
    
      if (country) {
        userContext += `El usuario está en ${country}. Adapta los ingredientes a lo que es común o disponible en esa región (ej: usa nombres locales si aplica). `;
      }
    
      if (preferredCuisines.length > 0) {
        userContext += `El usuario prefiere la cocina: ${preferredCuisines.join(", ")}. Si la receta se puede adaptar a estos estilos, menciónalo en el comentario. `;
      }
    
      if (!userContext) {
        userContext = "No hay preferencias específicas del usuario. ";
      }

      const prompt = `Eres un chef experto con conocimiento profundo de **cocina global**, especialmente de **platos tradicionales y cotidianos de LATINOAMÉRICA (Colombia, México, Argentina, Perú, Chile, etc.)**.

${userContext}

**Definición clave**: Una "receta válida" incluye **cualquier plato comestible real**, ya sea:
- Platos complejos: "bandeja paisa", "ajiaco", "ceviche"
- Platos simples: "carne asada", "milanesa", "arroz con huevo", "ensalada cesar", "sopa de cebolla"
- Platos internacionales: "paella", "ramen", "curry de pollo", "lasaña"
- Platos de un solo ingrediente preparado: "huevo frito", "plátano asado", "queso fundido"

**No son recetas válidas**: cosas no comestibles, absurdas o peligrosas (ej: "agua hervida", "ensalada de piedras", "sopa de plástico").

**ANTES DE ANALIZAR**:
1. Si el nombre "${recipe}" coincide con un plato de la lista de ejemplos arriba (o similar), **trátalo como una receta válida, incluso si es simple**.
2. Si es un plato regional latinoamericano (ej: "sancocho", "lechona", "tamales", "arepas rellenas", "pabellón criollo", "huasquito"), **asúmelo como auténtico y real**.
3. Solo rechaza si es claramente no comestible.

**Instrucciones para recetas válidas**:
- **Ingredientes**: lista solo los esenciales y realistas (ej. "milanesa": carne molida o filete, huevo, pan rallado, aceite; "carne asada": carne de res, sal, limón, ajo).
- **Tiempo**: sé realista (una "milanesa" toma 20-30 min, no 5 min).
- **Pasos**: 3-6 pasos claros, prácticos, sin jerga técnica innecesaria.
- **Comentario**: 
  • Menciona si faltan ingredientes comunes (ej: "¿quieres agregar papas fritas como acompañamiento?").
  • Sugiere sustituciones si hay alergias (${allergies.length > 0 ? 'alérgenos: ' + allergies.join(', ') : 'sin alergias'}).
  • Si el plato tiene variantes regionales, menciónalo brevemente (ej: "En Colombia se sirve con arroz y patacones").

**Formato de salida**: Devuelve **SOLO un JSON** con este formato exacto:
{
  "receta": "Nombre de la receta",
  "ingredientes": ["Ingrediente 1", "Ingrediente 2", ...],
  "pasos": ["Paso 1", "Paso 2", ...],
  "tiempo": "20-30 minutos",
  "comentario": "Notas útiles sobre autenticidad, ingredientes faltantes o adaptación a tus preferencias."
}`;
      
      // Llamada a OpenAI para analizar la receta.
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      
      // Limpieza robusta del contenido de la respuesta.
      const rawText = completion.choices[0]?.message?.content ?? "";
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    
      let result;
      try {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
        } else {
          result = JSON.parse(cleaned);
        }
      } catch {
        // Si falla el parseo, devuelve una respuesta segura por defecto.
        result = { 
          receta: recipe, 
          ingredientes: [],
          comentario: "No se pudo analizar la receta. Verifica el nombre e intenta de nuevo." 
        };
      }
    
      return NextResponse.json({ analysis: result });
    }

    // Error si no se proporciona ni 'ingredients' ni 'recipe'.
    return NextResponse.json(
      { error: "Debes enviar 'ingredients' (array) o 'recipe' (string)" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error en /api/recipe:", error);
    return NextResponse.json(
      { error: "Error al generar respuesta" },
      { status: 500 }
    );
  }
}