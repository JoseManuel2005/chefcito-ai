// app/api/recipe/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ingredients, recipe, userPreferences } = body;

    // Extraer preferencias (con valores por defecto seguros)
    const allergies = userPreferences?.allergies?.filter((a: any) => typeof a === 'string' && a.trim() !== '') || [];
    const preferredCuisines = userPreferences?.preferredCuisines?.filter((c: any) => typeof c === 'string' && c.trim() !== '') || [];
    const country = (typeof userPreferences?.country === 'string' ? userPreferences.country.trim() : '') || '';

    // === MODO 1: Ingredientes → Recetas ===
    if (ingredients && Array.isArray(ingredients)) {
      const validIngredients = ingredients
        .filter(ing => ing && typeof ing.name === 'string' && ing.name.trim() !== '');

      if (validIngredients.length === 0) {
        return NextResponse.json(
          { error: "La lista de ingredientes no puede estar vacía" },
          { status: 400 }
        );
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const expiringSoon: string[] = [];
      const others: string[] = [];
      const expired: string[] = [];

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

      // === Prompt final ===
      const prompt = `Eres un chef experto comprometido con la seguridad alimentaria y la reducción del desperdicio.
Sigue estas reglas estrictamente:
- ${allergies.length > 0 ? `NUNCA uses, sugieras ni menciones ninguno de estos alérgenos: ${allergies.join(", ")}.` : "No hay alergias reportadas."}
- ${preferredCuisines.length > 0 ? `Prioriza recetas inspiradas en: ${preferredCuisines.join(", ")}.` : "Sin preferencias culinarias específicas."}
- ${country ? `El usuario está en ${country}. Usa ingredientes accesibles y platos tradicionales o populares allí.` : "Ubicación no especificada."}

Ingredientes disponibles para usar (todos están en buen estado):
- 🚨 Ingredientes que vencen HOY o en los próximos 2 días (¡usa estos primero!): ${expiringSoon.length > 0 ? expiringSoon.join(", ") : "Ninguno"}
- ✅ Otros ingredientes frescos: ${others.length > 0 ? others.join(", ") : "Ninguno"}

Genera hasta 2 recetas cortas, realistas, seguras y deliciosas usando SOLO los ingredientes disponibles.
Puedes usar solo un ingrediente si es necesario.
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

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
    
      const prompt = `Eres un experto en cocina y nutrición.
${userContext}

Analiza la receta llamada "${recipe}" y devuelve SOLO un JSON con este formato exacto:
{
  "receta": "Nombre de la receta",
  "ingredientes": ["Ingrediente 1", "Ingrediente 2", ...],
  "tiempo": "30-40 minutos",
  "comentario": "Notas útiles: ¿faltan ingredientes comunes? ¿hay sustituciones por alergias o región? ¿se adapta a sus preferencias?"
}`;
    
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
    
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
        result = { 
          receta: recipe, 
          ingredientes: [],
          comentario: "No se pudo analizar la receta. Verifica el nombre e intenta de nuevo." 
        };
      }
    
      return NextResponse.json({ analysis: result });
    }

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