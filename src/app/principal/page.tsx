"use client";

import { useState } from "react";
import { 
  Utensils, 
  BookOpen, 
  Plus, 
  X, 
  ChefHat, 
  Search,
  Clock,
  Users,
  ArrowRight
} from "lucide-react";

export default function PrincipalPage() {
  const [mode, setMode] = useState<"ingredients" | "recipe" | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [recipe, setRecipe] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Agregar nuevo ingrediente
  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  // Cambiar valor de ingrediente
  const handleChangeIngredient = (value: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // Eliminar ingrediente
  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // Buscar recetas por ingredientes
  const handleSearchRecipes = async (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter((ing) => ing.trim() !== "");
    if (validIngredients.length === 0) return;

    setLoading(true);
    setRecipes([]);

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: validIngredients }),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Analizar receta
  const handleAnalyzeRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: recipe.trim() }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || null);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Resetear modo
  const handleResetMode = () => {
    setMode(null);
    setIngredients([""]);
    setRecipe("");
    setRecipes([]);
    setAnalysis(null);
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFCB2B] rounded-full mb-5">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Bienvenido a Chefsito!
          </h1>
          <p className="text-gray-600">
            Tu asistente culinario inteligente
          </p>
        </div>

        {/* Mode Selection */}
        {!mode && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setMode("ingredients")}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:border-yellow-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                  <Utensils className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Ingredientes → Recetas
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Genera recetas con tus ingredientes
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Dime qué ingredientes tienes y te sugeriré deliciosas recetas que puedes preparar.
              </p>
              <div className="flex items-center text-yellow-600 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setMode("recipe")}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-left hover:border-yellow-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Receta → Análisis
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Analiza ingredientes de una receta
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Dime el nombre de una receta y te mostraré todos los ingredientes necesarios.
              </p>
              <div className="flex items-center text-green-600 font-medium">
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* Ingredients Mode */}
        {mode === "ingredients" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mis ingredientes
                  </h2>
                  <p className="text-sm text-gray-600">
                    Agrega los ingredientes que tienes disponibles
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetMode}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchRecipes} className="space-y-6">
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleChangeIngredient(e.target.value, index)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-black focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors"
                      placeholder="Ej: tomate, cebolla, pollo..."
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-yellow-300 hover:text-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar ingrediente
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || ingredients.every(ing => ing.trim() === "")}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando recetas...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar recetas
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Recipe Mode */}
        {mode === "recipe" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Analizar receta
                  </h2>
                  <p className="text-sm text-gray-600">
                    Descubre los ingredientes de cualquier receta
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetMode}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAnalyzeRecipe} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={recipe}
                  onChange={(e) => setRecipe(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-black focus:border-green-400 focus:ring-1 focus:ring-green-400 focus:outline-none transition-colors"
                  placeholder="Ej: Paella valenciana, Tacos al pastor, Risotto..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !recipe.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analizando receta...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analizar ingredientes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Results: Recipes */}
        {recipes.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Recetas sugeridas
            </h3>
            {recipes.map((recipeItem, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                    <ChefHat className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {recipeItem.nombre || `Receta ${index + 1}`}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        2-4 personas
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        30-45 min
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Ingredientes:</h5>
                    <ul className="space-y-2">
                      {(recipeItem.ingredientes || []).map((ing: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Preparación:</h5>
                    <ol className="space-y-2">
                      {(recipeItem.pasos || []).map((paso: string, i: number) => (
                        <li key={i} className="flex gap-3 text-gray-700">
                          <span className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full shrink-0">
                            {i + 1}
                          </span>
                          <span>{paso}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results: Analysis */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {analysis.receta || "Análisis de receta"}
                </h4>
                <p className="text-gray-600">Ingredientes necesarios</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-4">Lista de ingredientes:</h5>
                <div className="space-y-2">
                  {(analysis.ingredientes || []).map((ing: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                      <span className="text-gray-700">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.comentario && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-4">Notas adicionales:</h5>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {analysis.comentario}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}