# Implementation Plan: Integración con Active Directory y Rebranding

**Branch**: `003-ad-integration-rebranding` | **Date**: 2026-02-05 | **Spec**: [specs/003-ad-integration-rebranding/spec.md]

## Summary
Implementación de la integración con Active Directory para la obtención de datos de usuario (`infoDominio`), automatización de remotos mediante archivos `.conf` con sustitución de variables y sistema de autologin seguro. Además, se realiza el rebranding completo de la aplicación a "Becall-Mount", incluyendo migración automática de datos existentes.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ (Electron)
**Primary Dependencies**: `electron`, `vite`, `svelte`, `node-powershell` (o wrapper `child_process`), `safeStorage`.
**Storage**: `electron-store` para metadatos y configuración, `rclone.conf` para remotos de rclone.
**Testing**: `vitest` para lógica de sustitución y migración, `playwright` para tests de integración Electron.
**Target Platform**: Windows 10/11 (win32).
**Project Type**: Electron Application (Main + Preload + Renderer).
**Performance Goals**: Sincronización de AD < 5s, Importación de archivos < 1s, Arranque con autologin < 2s.
**Constraints**: Dependencia de disponibilidad de Dominio para sincronización, requiere privilegios de Admin para instalar RSAT.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Library-First: La lógica de AD y el motor de sustitución se implementarán como módulos puros en `src/main/ad/` y `renderer/src/lib/`, testeables mediante Vitest de forma aislada sin requerir el proceso principal de Electron.
- [x] CLI Interface: No aplica estrictamente a la app Electron, pero las utilidades de PowerShell pueden probarse vía CLI.
- [x] Test-First: Se crearán tests unitarios para el motor de sustitución de variables antes de la implementación final.

## Project Structure

### Documentation (this feature)

```text
specs/003-ad-integration-rebranding/
├── spec.md              # Especificación funcional y clarificaciones
├── plan.md              # Este archivo (Plan de implementación)
├── research.md          # Investigación sobre PowerShell, Autologin y Rebranding
├── data-model.md        # Definición de infoDominio y Store
├── quickstart.md        # Guía de implementación paso a paso
├── contracts/
│   └── ipc-api.md       # Definición de canales IPC para AD y Auth
└── checklists/
    └── requirements.md  # Checklist de calidad de la especificación
```

### Source Code Updates

```text
src/
├── main/
│   ├── ad/              # Nuevo: Lógica de integración AD y PowerShell
│   │   ├── powershell.ts
│   │   └── sync.ts
│   ├── auth/            # Actualización: Soporte para autologin seguro
│   │   └── safe-storage.ts
│   ├── ipc/
│   │   ├── ad.ts        # Nuevo: Handlers IPC para AD
│   │   └── auth.ts      # Actualización: Autologin
│   └── utils/
│       ├── paths.ts     # Actualización: Nuevas rutas Becall-Mount
│       └── migration.ts # Nuevo: Lógica de movimiento de carpetas
├── renderer/
│   └── src/
│       ├── components/
│       │   └── Settings/
│       │       └── ADIntegration.svelte # Nuevo component UI
│       └── lib/
│           └── conf-processor.ts # Lógica de sustitución de variables
```

**Structure Decision**: Se mantiene la estructura monorepo de Electron, añadiendo servicios especializados en `main/` para las tareas de sistema (AD, Seguridad) y componentes dedicados en `renderer/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Porque |
|-----------|------------|-------------------------------------|
| Uso de `node-powershell` | Necesario para interoperabilidad nativa con AD cmdlets. | El uso de LDAP nativo es excesivamente complejo de configurar en entornos corporativos con SSO. |
| Migración manual de carpetas | Electron no gestiona automáticamente el cambio de AppId en instalaciones existentes. | Mantener la ruta antigua rompería la consistencia del rebranding. |