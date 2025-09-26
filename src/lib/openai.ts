import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Falta la variable de entorno: OPENAI_API_KEY");
}

// Cliente único de OpenAI para usar en el backend
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
