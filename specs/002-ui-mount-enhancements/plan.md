# Implementation Plan: UI & Mount System Enhancements

**Branch**: `002-ui-mount-enhancements` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ui-mount-enhancements/spec.md`

## Summary

This feature implements a comprehensive UI refresh and core functionality expansion for Becall-Mount. It includes applying a corporate color palette (Tailwind), redesigning the main interface with a FAB for "Add Service", and introducing a Splash Screen. Core enhancements include a dual mounting system (Drive Letter vs Local Folder) with mutual exclusivity, persistent preferences via Electron Store, "Unmount All" capability, and a secure Configuration Export/Import system using AES-256 encryption.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js (Electron)
**Primary Dependencies**: Electron 40+, Svelte 5.x, Tailwind 4.x, DaisyUI 5.x
**Storage**: `electron-store` (for mount preferences), Local Filesystem (for config import/export)
**Testing**: Vitest (Unit/Integration)
**Target Platform**: Windows 10/11 (Desktop)
**Project Type**: Electron (Main + Renderer)
**Performance Goals**: Splash screen min 2s display; "Add Service" FAB responsive; Mount checks < 500ms
**Constraints**: Must use existing `rclone` binary wrapper; No admin privileges required (User Space)
**Scale/Scope**: < 100 configured services; Local desktop context only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Seguridad Primero**: Config exports encrypted with AES-256 (FR-CFG-02). No plaintext creds.
- [x] **Usabilidad**: New FAB and simplified mounting workflow (HU-3.1, HU-2.8).
- [x] **Arquitectura**: UI (Svelte) decoupled from Main process (Rclone wrapper) via IPC.
- [x] **Calidad**: Testing with Vitest required for new logic (Config encryption, Mount validation).
- [x] **Accesibilidad**: Tailwind colors must meet contrast ratios.
- [x] **Stack**: Uses mandated Svelte 5, Tailwind, Electron Forge, Electron-Store.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-mount-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── ipc/
│   │   ├── config-transfer.ts  # [NEW] Import/Export logic
│   │   └── system.ts           # [UPDATE] Splash logic
│   ├── main.ts                 # [UPDATE] Splash window creation
│   └── rclone/
│       └── mount.ts            # [UPDATE] Folder mounting logic
├── renderer/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Mount/
│   │   │   │   └── MountModal.svelte # [UPDATE] Drive/Folder tabs
│   │   │   ├── Shared/
│   │   │   │   └── FAB.svelte        # [NEW] Floating Action Button
│   │   │   └── Splash/
│   │   │   │   └── SplashScreen.svelte # [NEW]
│   │   ├── pages/
│   │   │   └── ServiceManager.svelte # [UPDATE] UI Layout
│   │   └── lib/
│   │       └── crypto.ts             # [NEW] Export encryption
└── tailwind.config.js          # [UPDATE] Corporate palette
```

**Structure Decision**: Adhering to existing Electron/Svelte structure. Adding dedicated IPC modules for new major features (Config Export) to avoid bloating `main.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (None)    |            |                                     |