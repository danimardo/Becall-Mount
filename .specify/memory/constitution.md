# Cloud Mount Constitution

## Principios Fundamentales (Core Principles)

### I. Seguridad Primero (Security First)
*   **Encriptación Obligatoria:** Todas las credenciales y configuraciones sensibles deben almacenarse encriptadas. El archivo de configuración de Rclone nunca debe guardar contraseñas en texto plano.
*   **Protección Maestra:** La aplicación requiere una contraseña maestra para iniciarse y desencriptar la configuración.
*   **Privacidad de Logs:** Nunca escribir credenciales, tokens o información sensible en los logs de la aplicación o del sistema.

### II. Usabilidad y Simplicidad (Usability & Simplicity)
*   **Enfoque No Técnico:** La interfaz debe abstraer la complejidad de la línea de comandos. El usuario no debe necesitar saber qué es un "remote" o "flag" de Rclone para usar las funciones básicas.
*   **Eficiencia:** Operaciones críticas (montar/desmontar) accesibles en máximo 2 clics.
*   **Feedback Inmediato:** Toda acción debe tener una respuesta visual clara (éxito, carga, error).
*   **Idioma:** Interfaz 100% en Español.

### III. Arquitectura y Separación (Architecture)
*   **Separación Lógica-Vista:** La lógica de interacción con Rclone (wrapper/servicios) debe estar desacoplada de la interfaz de usuario (Componentes Svelte).
*   **Gestión de Estado:** El estado de la UI debe reflejar fielmente el estado del sistema (montajes reales).
*   **Portabilidad y Permisos:** La aplicación debe funcionar sin instalación administrativa y almacenar datos en `%APPDATA%` (User Space). No debe requerir elevación de privilegios UAC salvo que sea estrictamente inevitable para el montaje.

### IV. Calidad y Pruebas (Quality & Testing)
*   **Cobertura Mínima:** Mantener una cobertura de pruebas unitarias superior al **80%**.
*   **Pruebas de Integración:** Verificar el correcto "spawning" de procesos Rclone y el manejo de sus salidas (stdout/stderr).
*   **Manejo de Errores:** Todos los errores deben ser capturados y presentados al usuario de forma amigable, no como stack traces.

### V. Accesibilidad (Accessibility)
*   **Estándares:** Seguir pautas WCAG 2.1 AA.
*   **Navegación:** Toda la funcionalidad debe ser accesible vía teclado.
*   **Contraste y Claridad:** Uso de colores y tamaños de fuente legibles. Soporte para temas Claro/Oscuro.

## Stack Tecnológico (Technology Stack)

Se utilizarán estrictamente las siguientes tecnologías y versiones (o superiores estables):

### Build & Packaging
*   **Electron Forge:** Herramienta estándar para empaquetado y distribución (Template Vite + TypeScript).
*   **Electron:** Última versión estable.

### Runtime & Backend Local (Main Process)
*   **Node.js:** (Version lts/iron o superior).
*   **Rclone:** Última versión estable (Binario externo gestionado por la app).
*   **Electron-Store:** Para persistencia de preferencias simples.

### Frontend & UI (Renderer Process)
*   **Svelte:** v5.x+ (Framework reactivo de alto rendimiento).
*   **TypeScript:** Tipado estático obligatorio.
*   **Vite:** Build tool (integrado con Electron Forge).
*   **Tailwind CSS:** v3.4+ (Styling).
*   **DaisyUI:** v4.x+ (Componentes de UI).
*   **Lucide Svelte:** Biblioteca de iconos.

### Testing
*   **Vitest:** Runner de pruebas unitarias.
*   **Svelte Testing Library:** Pruebas de componentes.

## Gobernanza
Esta constitución define los límites innegociables del proyecto Cloud Mount.
1.  **Framework:** No se permite cambiar Electron Forge/Svelte por otra tecnología sin una re-evaluación completa del proyecto.
2.  **Seguridad:** Jamás se comprometerá la seguridad de las credenciales por conveniencia en el desarrollo.

**Versión:** 1.2.0 | **Fecha:** 17/01/2026 | **Proyecto:** Cloud Mount