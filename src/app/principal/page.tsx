"use client";

import { useState } from "react";

export default function PrincipalPage() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients.split(",").map((i) => i.trim()),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRecipes(data.recipes || []);
      } else {
        setError(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error(err);
      setError("Error en la petición");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chefsito 🍳</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Ej: pollo, arroz"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar recetas"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <section className="mt-6">
        {recipes.length > 0 && (
          <div className="space-y-4">
            {recipes.map((r, idx) => (
              <div key={idx} className="border p-4 rounded shadow">
                <h2 className="font-semibold text-lg">{r.nombre}</h2>
                <p className="text-sm text-gray-700">
                  <strong>Ingredientes:</strong> {r.ingredientes.join(", ")}
                </p>
                <ol className="list-decimal list-inside mt-2">
                  {r.pasos.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
