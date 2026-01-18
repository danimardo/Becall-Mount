# Feature Specification: UI & Mount System Enhancements

**Feature Branch**: `002-ui-mount-enhancements`
**Created**: 2026-01-18
**Status**: Draft
**Input**: Comprehensive update request covering UI redesign, folder mounting, and configuration management.

## Clarifications

### Session 2026-01-18
- Q: How should the system handle mounting to a non-empty local folder? -> A: Warn. Show a confirmation dialog ("Folder is not empty. Local files will be hidden...") before proceeding.
- Q: What storage mechanism should be used for per-service mount preferences? -> A: Electron Store (JSON). Maintain consistency with existing architecture; sufficient for expected data volume.
- Q: How should the app version be displayed on the splash screen? -> A: Loose. Display the raw version string exactly as defined in `package.json`.

## User Scenarios & Testing

### User Story 1 - UI Redesign & Branding (Priority: P1)

As a user, I want a modern, consistent interface with clear actions so that the application feels professional and easy to navigate.

**Why this priority**: Fundamental visual overhaul affecting all other interactions.

**Acceptance Scenarios**:

1. **Given** the main window, **When** viewing the "Add Service" button, **Then** it should be a floating round button (+) at the bottom-right (above footer buttons).
2. **Given** the footer, **When** viewing actions, **Then** "Settings" should be a round gear icon and "About" should be a round "?" icon.
3. **Given** any component, **When** rendering, **Then** it must use the new Corporate Color Palette (Brand Green/Blue) defined in Tailwind.
4. **Given** the "About" button, **When** clicked, **Then** show a modal with developer photo, credits, and dynamic version number.
5. **Given** the "Settings" button, **When** clicked, **Then** show the settings modal (redesigned button, same functionality).
6. **Given** the header, **When** viewing top-right, **Then** show a red "Unmount All" (stop-circle) button.

---

### User Story 2 - Advanced Mounting System (Priority: P1)

As a user, I want to choose between mounting to a drive letter OR a local folder so that I can organize my cloud storage exactly where I want it.

**Why this priority**: Core functionality expansion requested by user.

**Acceptance Scenarios**:

1. **Given** the Mount Modal, **When** opened, **Then** allow mutually exclusive selection: "Mount to Drive" OR "Mount to Folder".
2. **Given** "Mount to Drive" selected, **When** viewing selector, **Then** show available letters with NO pre-selection ("Select letter..." placeholder).
3. **Given** "Mount to Folder" selected, **When** viewing input, **Then** allow typing path or browsing via Windows Native Dialog.
4. **Given** a successful mount, **When** closing app, **Then** persist the last used method (Drive/Folder) and target (Letter/Path) for that service.
5. **Given** "Mount to Folder", **When** connecting, **Then** use `rclone mount remote: "C:\Path"` syntax.
6. **Given** a target folder that is NOT empty, **When** clicking Mount, **Then** show a warning dialog explaining that local files will be hidden.

---

### User Story 3 - Mass Unmount (Priority: P2)

As a user, I want to unmount all active services with one click so that I can quickly disconnect everything.

**Acceptance Scenarios**:

1. **Given** multiple mounted services, **When** clicking "Unmount All" (top-right), **Then** show a confirmation dialog.
2. **Given** confirmation, **When** proceeding, **Then** trigger unmount for all active services and show a summary notification.
3. **Given** cancellation, **When** clicked, **Then** do nothing.

---

### User Story 4 - Configuration Export/Import (Priority: P2)

As a user, I want to backup and restore my service configurations securely so that I can migrate or save my setup.

**Acceptance Scenarios**:

1. **Given** Settings modal, **When** "Export" clicked, **Then** allow selecting specific services.
2. **Given** services selected, **When** exporting, **Then** prompt for a *new* encryption password for the file.
3. **Given** password set, **When** saving, **Then** generate an AES-256 encrypted `.conf` file.
4. **Given** Settings modal, **When** "Import" clicked, **Then** prompt to select a `.conf` file.
5. **Given** an encrypted file, **When** selected, **Then** prompt for password to decrypt.
6. **Given** decrypted config, **When** importing, **Then** detect name conflicts and offer resolution (Overwrite/Skip/Rename).

---

### User Story 5 - Splash Screen (Priority: P3)

As a user, I want a professional startup experience so that I know the app is loading.

**Acceptance Scenarios**:

1. **Given** app startup, **When** launching, **Then** show a borderless splash screen with Logo, Name, and Credits.
2. **Given** splash screen, **When** shown, **Then** remain visible for at least 2 seconds (even if app loads faster).
3. **Given** app ready, **When** 2 seconds passed, **Then** fade out splash and show main window.
4. **Given** splash screen display, **When** version is rendered, **Then** use the raw version string from `package.json`.

## Requirements

### Functional Requirements

- **FR-UI-01**: System MUST implement the defined Tailwind color palette (`brand-blue`, `brand-green`, etc.) across all components.
- **FR-UI-02**: "Add Service" button MUST be a floating circular action button (FAB) at bottom-right.
- **FR-MNT-01**: System MUST support mounting to local NTFS folders as an alternative to drive letters.
- **FR-MNT-02**: Mount targets (Drive vs Folder) MUST be mutually exclusive in the UI.
- **FR-MNT-03**: System MUST persist the specific mount preference (Type + Target) per service using `electron-store`.
- **FR-MNT-04**: System MUST check if the target folder is empty before mounting and display a warning dialog if files exist.
- **FR-OPS-01**: "Unmount All" MUST verify all unmount operations and report success/failure count.
- **FR-CFG-01**: Export function MUST allow partial export (selecting specific services).
- **FR-CFG-02**: Exported files MUST be encrypted with a user-provided password (separate from master password) using AES-256 (or compatible).
- **FR-CFG-03**: Import function MUST handle name collisions via a resolution dialog.
- **FR-SYS-01**: Splash screen MUST run in a separate lightweight BrowserWindow and enforce a minimum 2s display time.
- **FR-SYS-02**: Splash screen MUST display the application version string exactly as retrieved from the system's package metadata.

### Key Entities

- **MountPreference**: Stores user choice for a service (`type`: 'drive'|'folder', `value`: 'Z'|'C:\Path').
- **ExportPackage**: Structure of the exported file (Header + Salt + IV + EncryptedPayload).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Splash screen displays for exactly max(2s, load_time) with smooth transitions.
- **SC-002**: Users can mount to a folder in equal or fewer clicks than mounting to a drive (excluding path typing).
- **SC-003**: Exported configuration files cannot be decrypted without the specific export password.
- **SC-004**: "Unmount All" successfully terminates 100% of tracked mount processes.

## Technical Implementation Details

### Splash Screen Logic
- **Process**: Created in `main.ts` before `mainWindow`.
- **Timing**: `Math.max(0, 2000 - elapsed_load_time)` used to delay `splash.close()`.
- **Window**: `frame: false`, `transparent: true`, `alwaysOnTop: true`.

### Configuration Encryption
- **Algorithm**: AES-256-CBC.
- **Key Derivation**: PBKDF2 or scrypt (consistent with main app security).
- **File Format**: Binary or Base64 containing `Salt + IV + Ciphertext`.

### Folder Mounting
- **Command**: `rclone mount remote:path "C:\Local\Path" --vfs-cache-mode full`
- **Validation**: Ensure target folder exists or prompt to create. Check for emptiness (`fs.readdir`).

### UI Architecture
- **Palette**: defined in `tailwind.config.js` under `colors.brand`.
- **Icons**: Use existing icon set, updated to be circular/floating where specified.