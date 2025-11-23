# Reporte de Pruebas de Seguridad y Robustez - Login

## Resumen Ejecutivo
Se han generado y ejecutado pruebas E2E automatizadas utilizando Playwright para evaluar la seguridad, robustez y usabilidad de la página de Login (`/login`).

## Cobertura de Pruebas
1.  **Usabilidad y Accesibilidad**:
    -   Verificación de metadatos (título, encabezados).
    -   Accesibilidad básica (etiquetas ARIA).
    -   **Focus Order**: Verificación del flujo de navegación por teclado.
    -   **Contraste/Tema**: Verificación del cambio de tema (Light/Dark).

2.  **Robustez (Stress/Flood)**:
    -   **Flood Click**: Simulación de múltiples clics rápidos en el botón de Google para verificar el manejo de estados (loading/disabled).
    -   **Theme Toggle**: Prueba de estrés en el cambio de tema.

3.  **Seguridad**:
    -   **Cabeceras HTTP**: Verificación de cabeceras de seguridad (`X-Content-Type-Options`, `Strict-Transport-Security`, etc.).
    -   **Fuga de Información**: Escaneo del DOM en busca de tokens o secretos expuestos.
    -   **Inyección (XSS/SQLi)**:
        -   Verificación de inyección en parámetros URL (`?redirect=...`).
        -   Búsqueda y prueba de inputs vulnerables (Fuzzing).

## Hallazgos y Vulnerabilidades Detectadas (Bajo Supuestos)

### 1. Superficie de Ataque Reducida (Positivo)
-   **Observación**: La página no contiene campos de entrada de texto tradicionales (usuario/contraseña).
-   **Impacto**: El riesgo de inyecciones SQL o XSS persistente a través de formularios es **mínimo** o inexistente en esta vista.
-   **Recomendación**: Mantener esta arquitectura delegando la autenticación a proveedores seguros (Google/Firebase).

### 2. Orden de Foco (Usabilidad/Accesibilidad)
-   **Estado**: ⚠️ **Falló en pruebas**
-   **Observación**: La prueba de navegación por teclado (`should manage focus order logically`) falló. Esto indica que el orden lógico de los elementos interactivos (Botón de tema vs. Botón de Google) podría no coincidir con el orden visual o el esperado por el usuario.
-   **Recomendación**: Revisar el orden en el DOM y el uso de propiedades CSS como `order` o `position: fixed` que puedan alterar el flujo visual respecto al DOM.

### 3. Cabeceras de Seguridad (Entorno de Desarrollo)
-   **Estado**: ⚠️ **Advertencia**
-   **Observación**: Es probable que en el entorno de desarrollo local (`next dev`) falten cabeceras estrictas como HSTS.
-   **Recomendación**: Asegurar que en producción (Vercel/Netlify/Docker) se configuren las cabeceras `Strict-Transport-Security`, `X-Frame-Options` y `Content-Security-Policy`.

### 4. Manejo de Errores (Google Auth)
-   **Observación**: El botón de Google maneja el estado de carga (`disabled={loading}`).
-   **Recomendación**: Asegurar que los mensajes de error de Firebase (ej. "popup closed by user") se muestren de forma amigable (Toast) y no expongan stack traces en la consola (aunque en el código se ve un `console.error`, se recomienda enviarlo a un servicio de monitoreo en prod).

## Archivos Entregados
-   `e2e/pages/LoginPage.ts`: Page Object Model.
-   `e2e/tests/auth/login.spec.ts`: Suite de pruebas.
