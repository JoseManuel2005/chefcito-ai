# 🍳 Chefcito AI

Chefcito AI es una aplicación que ayuda a las personas a aprovechar al máximo los ingredientes que ya tienen en casa, reduciendo el desperdicio de alimentos y generando recetas prácticas y personalizadas con apoyo de **Inteligencia Artificial**.

Este proyecto ha evolucionado desde su MVP inicial para integrar varias capacidades avanzadas: reconocimiento de texto en imágenes (OCR), identificación de ingredientes y platos desde fotos, generación de imágenes de platos y pasos (Gemini / Google GenAI), transcripción de audio (Whisper/OpenAI), texto a voz (TTS), y generación y análisis de recetas mediante OpenAI.

---

## 🌟 Propósito del MVP

En muchos hogares se desperdician alimentos debido a la falta de planificación y la dificultad de aprovechar ingredientes disponibles, especialmente los que están próximos a vencer.  
Esto implica:

- Pérdidas económicas para las familias.  
- Impacto ambiental evitable.  
- Fricción diaria en la decisión de *“qué cocinar”*.  

El **MVP de Chefcito AI** valida una solución mínima para:  

- Registrar ingredientes disponibles (incluyendo fecha de vencimiento opcional).  
- Recibir sugerencias de recetas personalizadas que prioricen los ingredientes próximos a caducar.  
- Reducir tiempo en la toma de decisión y minimizar alimentos desechados.  

---

## 🎯 Audiencia Objetivo

- **Perfil prioritario**: jóvenes ocupados (estudiantes, profesionales) que cocinan ocasionalmente y buscan soluciones rápidas.  
- **Perfil secundario**: hogares pequeños (2–3 personas) interesados en ahorro y sostenibilidad.  

---

## ⚙️ Funcionalidades principales

### 👤 Registro de perfil básico
- Cuestionario inicial: alergias, tipo de comida preferida, ingrediente favorito y país/región.  
- Esta información se utiliza como contexto para las recomendaciones de IA.  

### 🥕 Ingreso rápido de ingredientes
- Agrega manualmente ingredientes disponibles.  
- Opción de añadir fecha de vencimiento para priorizar su uso.  
- Los datos se usan en la consulta a la IA (no se almacenan de forma persistente en el MVP).  

### 🤖 Sugerencia de recetas con IA
- Genera **2 recetas personalizadas** basadas en los ingredientes y perfil del usuario.  
 - Genera **2 recetas personalizadas** basadas en los ingredientes y perfil del usuario.  
 - **OCR** para extraer texto de imágenes (Vision API) y limpieza automática de listas de ingredientes.
 - **Identificación de ingredientes en imágenes** usando GPT-4 Vision (detecta ingredientes crudos en fotos de despensas y refrigeradores).
 - **Identificación de platos** desde imagen (p. ej. bandeja paisa, ajiaco, milanesa) con nivel de confianza.
 - **Generación de imágenes** de platos e ilustraciones de pasos (Google Gemini / GenAI).
 - **Transcripción de audio** (Whisper) para convertir recetas habladas a texto.
 - **Texto a voz (TTS)** para reproducir instrucciones y pasos en audio (MP3).
 - **Generación de videos de receta**: se combinan imágenes de pasos, audio y FFmpeg para crear videos cortos de cocina.
 - **Autenticación** con Google (Firebase) y almacenamiento básico de favoritos en Firestore.
- Prioriza el uso de ingredientes con menor vida útil.  

### 📋 Detalle de receta personalizada
- Incluye pasos básicos, tiempo estimado e ingredientes usados.  
- Destaca aquellos que evitan desperdicio.  

### 🔎 Modo búsqueda inversa (básico)
- Ingresa el nombre de una receta que quieras preparar.  
- La IA valida si puedes hacerla con tus ingredientes.  
- Si faltan, te lista los ingredientes necesarios.  

---

## 🖥️ Manual de Usuario

### Inicio
- Explora las funciones principales de Chefcito AI.  
- Interfaz intuitiva, responsive, modo claro/oscuro y recomendaciones personalizadas.  

### Ingredientes → Recetas
1. Agrega tus ingredientes.  
2. Opcional: añade fechas de vencimiento.  
3. Haz clic en **“Buscar recetas”** y recibe sugerencias.  

👉 *Consejo*: cuantos más ingredientes agregues, más variadas serán las recetas.  

### Análisis de Recetas
1. Pega cualquier receta encontrada en internet.  
2. La IA identifica ingredientes y pasos.  
3. Revisa la lista organizada y comentarios útiles.  

👉 *Mejor práctica*: incluir cantidades y medidas para mayor precisión.  

### Preferencias y Configuración
- Registra alergias alimentarias (ej. maní, gluten, lactosa, mariscos).  
- Selecciona tipos de cocina preferidos.  
- Indica tu región para priorizar ingredientes locales.  
- Cambia entre modo claro/oscuro.  

---

## 🔐 Seguridad de datos
Toda la información de preferencias se guarda de forma segura y se usa únicamente para mejorar las recomendaciones de recetas.
Las claves y credenciales nunca deben subirse a GitHub: usa `.env.local` en desarrollo y variables de entorno en tu plataforma de despliegue (Vercel, Cloud Run, etc.).

---

## 🚀 Tecnologías utilizadas
- **Next.js / React**  
- **TailwindCSS**  
- **Framer Motion**  
- **Lucide React Icons**  
- **OpenAI API** (para la generación y análisis de recetas)
- **Vercel** (despliegue)  
- **Google GenAI (Gemini)** para generación de imágenes
- **Google Vision API** para OCR
- **Firebase** (Auth, Firestore) para usuarios y favoritos
- **FFmpeg (WebAssembly)** para crear videos de receta en el cliente

---

## 📌 Estado del proyecto
Este proyecto está en fase **MVP** (Producto Mínimo Viable).  
Se han añadido múltiples capacidades experimentales de IA: imagen, audio, OCR y generación multimedial. Algunas rutas usan APIs que pueden requerir cuotas y claves separadas (OpenAI, Google Cloud).
El objetivo es validar el flujo básico **(ingredientes → recetas)** y medir el impacto en reducción de desperdicio y ahorro de tiempo.  

---

## 📜 Licencia
Este proyecto se distribuye bajo la licencia MIT.

---

## 🆕 ¿Qué hay de nuevo?
- OCR + limpieza de ingredientes (API: `/api/ocr` y `/api/clean-ingredients`) 
- Identificación de ingredientes crudos desde imágenes (API: `/api/identify-raw-ingredients`) 
- Identificación de platos desde imágenes (API: `/api/identify-dish`) 
- Generación de imágenes de platos y pasos (API: `/api/generate-dish-image`, `/api/generate-step-image`) 
- Transcripción de audio y TTS (API: `/api/transcribe`, `/api/tts`) 
- Composición de videos de receta con imágenes y audio (hook: `useRecipeVideo.ts`) 

## 🛠️ Requisitos y variables de entorno
Recomendado: Node.js 18+ y npm 10+.

En el archivo `.env.local` (o en tus secretos de despliegue) define al menos las siguientes variables:

```
OPENAI_API_KEY=sk-...          # Clave de OpenAI (servidor)
GEMINI_API_KEY=...            # Clave para Google GenAI (si usas generación con Gemini)
GOOGLE_APPLICATION_CREDENTIALS_JSON=...  # JSON de la cuenta de servicio Google codificado en base64 (para Vision API)

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_PRIVATE_KEY=...       # (opcional) token/clave para admin si se requiere
```

PowerShell: para codificar tu JSON de credenciales a base64 usa (ejemplo):
```
$json = Get-Content path\to\key.json -Raw; [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
```

---


## 📡 APIs (endpoints y uso rápido)

1) POST `/api/recipe` — Genera recetas o analiza una receta
- Payload para GENERAR:
```
POST /api/recipe
{
	"ingredients": [{"name":"tomate","expiry":"2025-11-27"}, {"name":"huevo"}],
	"userPreferences": {"allergies": ["mariscos"], "preferredCuisines": ["colombiana"], "country": "Colombia"}
}
```

- Payload para ANALIZAR una receta existente:
```
POST /api/recipe
{
	"recipe": "ajiaco",
	"userPreferences": { ... }
}
```

2) POST `/api/clean-ingredients` — Limpia texto crudo de ingredientes
```
POST /api/clean-ingredients
{ "rawText": "Tomates 2 kg\nazúcar\n1/2 leche" }
```

3) POST `/api/identify-raw-ingredients` — Detecta ingredientes crudos en imagen (base64)
```
POST /api/identify-raw-ingredients
{ "imageBase64": "...", "userPreferences": {"dietaryRestrictions": ["lactose"]} }
```

4) POST `/api/identify-dish` — Identifica plato cocinado desde imagen
```
POST /api/identify-dish
{ "imageBase64": "..." }
```

5) POST `/api/generate-dish-image` — Genera imagen del plato (Gemini)
```
POST /api/generate-dish-image
{ "recipeName": "Arroz con pollo", "ingredients": ["arroz", "pollo", "zanahoria"] }
```

6) POST `/api/generate-step-image` — Genera ilustración de un paso
```
POST /api/generate-step-image
{ "stepText": "Picar la cebolla en juliana" }
```

7) POST `/api/ocr` — Extrae texto de una imagen (FormData: `image` as file)

8) POST `/api/transcribe` — Transcribe audio (FormData: `audio`)

9) POST `/api/tts` — Genera audio MP3 de un texto
```
POST /api/tts
{ "text": "Pica la cebolla en juliana" }
```

---

## 🧪 Modo desarrollo y recomendaciones
- Evita subir credenciales a git; usa `.env.local` durante el desarrollo.
- Algunas APIs (OpenAI/Gemini/Google) pueden incurrir en costos; valida límites de uso y pruebas pequeñas.

---
