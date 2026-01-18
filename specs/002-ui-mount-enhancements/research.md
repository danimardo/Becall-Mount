# Phase 0: Research & Technical Decisions

**Feature**: UI & Mount System Enhancements
**Date**: 2026-01-18

## 1. Splash Screen Implementation

**Decision**: Use a secondary `BrowserWindow` in the Main process.
**Rationale**:
- Ensures the splash screen appears immediately while the heavier Main Window loads and hydrates.
- Allows complete visual control (transparency, no borders) independent of the app frame.
- **Timing**: Use `Promise.all([mainWindow.loadURL(...), wait(2000)])` pattern to enforce minimum display time.

## 2. Secure Configuration Export

**Decision**: Use Node.js native `crypto` module with AES-256-CBC.
**Rationale**:
- Standard, secure, and requires no external dependencies.
- **Format**: File will contain `Salt (16 bytes) + IV (16 bytes) + Encrypted Payload`.
- **Key Derivation**: `scrypt` or `pbkdf2` to derive the 256-bit key from the user-provided password.
- **Extension**: `.conf` (encrypted binary/base64 content).

## 3. Folder Mounting Strategy

**Decision**: Rclone `mount` command with direct path target.
**Rationale**:
- Rclone supports mounting to a directory path on Windows (`rclone mount remote: C:\Path`).
- **Validation**:
  - Must check if folder exists (`fs.existsSync`).
  - Must check if folder is empty (`fs.readdirSync().length === 0`).
  - If not empty -> User Confirmation Dialog (Requirement FR-MNT-04).
- **Persistence**: Store `lastMountType` ('drive' | 'folder') and `lastMountTarget` ('Z' | 'C:\Path') in `electron-store`.

## 4. UI Architecture (Svelte + Tailwind)

**Decision**: "Theme-first" approach with Tailwind configuration.
**Rationale**:
- Define `colors.brand.*` in `tailwind.config.js` rather than hardcoding hex values in components.
- Ensures consistency across light/dark modes (`daisyui` themes).
- **Icons**: Use existing `lucide-svelte` but wrapped in new circular container classes for uniformity.

## 5. IPC Architecture for Config Transfer

**Decision**: Dedicated `ipc/config-transfer.ts` handler.
**Rationale**:
- Keeps `main.ts` clean.
- Encapsulates complex file I/O and encryption logic away from the UI thread.
- **Channels**: `config:export` (renderer -> main), `config:import` (renderer -> main).
