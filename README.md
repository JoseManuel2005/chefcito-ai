# 🍳 Chefcito AI

Chefcito AI es una aplicación que ayuda a las personas a aprovechar al máximo los ingredientes que ya tienen en casa, reduciendo el desperdicio de alimentos y generando recetas prácticas y personalizadas con apoyo de **Inteligencia Artificial**.

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

---

## 🚀 Tecnologías utilizadas
- **Next.js / React**  
- **TailwindCSS**  
- **Framer Motion**  
- **Lucide React Icons**  
- **OpenAI API** (para la generación y análisis de recetas)  

---

## 📌 Estado del proyecto
Este proyecto está en fase **MVP** (Producto Mínimo Viable).  
El objetivo es validar el flujo básico **(ingredientes → recetas)** y medir el impacto en reducción de desperdicio y ahorro de tiempo.  

---

## 📜 Licencia
Este proyecto se distribuye bajo la licencia MIT.  
