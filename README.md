# ☁️ Becall-Mount

[![Electron](https://img.shields.io/badge/Electron-40.0.0-blue.svg)](https://www.electronjs.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-orange.svg)](https://svelte.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Becall-Mount** es una potente aplicación de escritorio para Windows que transforma tus servicios de almacenamiento en la nube en unidades de disco locales. Basada en el motor de **Rclone**, permite gestionar, montar y acceder a tus archivos remotos directamente desde el Explorador de Windows como si estuvieran en tu propio ordenador.

---

## ✨ Características Principales

- **🚀 Montaje Instantáneo**: Convierte buckets de S3, Google Cloud, Azure o servidores FTP/SFTP en letras de unidad (Z:, V:, etc.).
- **🔐 Seguridad de Grado Militar**: Encriptación AES-256 de todas tus credenciales mediante una Contraseña Maestra obligatoria.
- **📂 Importación Inteligente**: Soporte nativo para archivos JSON de Google Service Account (embebidos de forma segura sin dejar rastros en disco).
- **🎨 Personalización Visual**: Las unidades montadas muestran el icono oficial del servicio y etiquetas personalizadas en el sistema.
- **🔄 Auto-Actualización**: Verificación mensual automática de los drivers de montaje (Rclone) para garantizar seguridad y rendimiento.
- **⚙️ Gestión Avanzada**: Exportación e importación de configuraciones protegidas por contraseña.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Svelte 5 (Runes) + Vite.
- **Estilos**: Tailwind CSS + DaisyUI.
- **Backend**: Node.js + Electron.
- **Motor de Montaje**: Rclone + WinFsp.
- **Persistencia**: Electron Store (encriptado).

---

## 🚀 Guía de Desarrollo

### Requisitos Previos
- [Node.js](https://nodejs.org/) (Versión 18 o superior).
- [Git](https://git-scm.com/).

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/becall-mount.git

# Entrar en la carpeta
cd becall-mount

# Instalar dependencias
npm install
```

### Ejecución en Modo Desarrollo
Para lanzar la aplicación con recarga en caliente (HMR):
```bash
npm run start
```
*(Nota: Si utilizas un script personalizado como `npm run dev`, asegúrate de que esté configurado en tu package.json).*

---

## 📦 Generación de Instaladores

Becall-Mount utiliza **Electron Forge** para el empaquetado y distribución.

| Comando | Acción | Resultado |
| :--- | :--- | :--- |
| `npm run package` | **Empaquetar** | Genera la aplicación ejecutable en una carpeta (`/out/Becall-Mount-win32-x64/`). Ideal para pruebas locales rápidas sin instalar. |
| `npm run make` | **Crear Instalador** | Genera el instalador final (`setup.exe`) y paquetes distribuibles en `/out/make/`. Este es el archivo para compartir con usuarios. |

---

## 🆙 Gestión de Versiones (SemVer)

Seguimos el estándar de **Versionado Semántico** (MAYOR.MENOR.PATCH). Puedes incrementar la versión automáticamente usando los siguientes comandos:

| Comando | Tipo de Cambio | Descripción |
| :--- | :--- | :--- |
| `npm version patch` | **PATCH** (0.0.x) | Corrección de errores o cambios menores. |
| `npm version minor` | **MINOR** (0.x.0) | Nuevas funcionalidades que no rompen compatibilidad. |
| `npm version major` | **MAJOR** (x.0.0) | Cambios estructurales o grandes actualizaciones. |

*Estos comandos actualizarán automáticamente el `package.json` y crearán un tag de Git.*

---

## 🎨 Identidad Visual

La aplicación sigue una paleta de colores moderna y limpia:
- **Azul Marca**: `#5EC2F6` (Botones de acción, enlaces).
- **Verde Éxito**: `#6FC30A` (Botones de confirmación, estados OK).
- **Pistacho**: `#96CE4D` (Badges y detalles secundarios).
- **Fondos**: `#FDFDFD` (Claro) / `#0F172A` (Oscuro).

---

## 👤 Autor

Diseñado e implementado con ❤️ por:
**Daniel Díez Mardomingo** - [danimardo@yahoo.es](mailto:danimardo@yahoo.es)

---

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
