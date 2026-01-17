# Tasks: Cloud Mount MVP

**Feature**: `001-create-cloud-mount`
**Status**: Pending
**Spec**: `specs/001-create-cloud-mount/spec.md`

## Dependencies

1. **Phase 1: Setup** (Project initialization)
2. **Phase 2: Foundation** (Core backend & Architecture)
3. **Phase 3: Initial Setup & Security** [US1] (Prerequisite for all features)
4. **Phase 4: Service Management** [US2] (Configuring remotes)
5. **Phase 5: Mounting Drives** [US3] (Core functionality)
6. **Phase 6: System Tray & Persistence** [US4] (Background operation)
7. **Phase 7: Settings & Polish** [US5] (UX refinements)

## Phase 1: Setup
**Goal**: Initialize project with Electron Forge, Svelte, and TypeScript.

- [x] T001 Initialize Electron Forge project with Svelte + TypeScript template
- [x] T002 Install dependencies (DaisyUI, TailwindCSS, electron-store, uuid, fs-extra)
- [x] T003 Configure TailwindCSS and DaisyUI in `tailwind.config.js` and `src/renderer/index.css`
- [x] T004 Create project directory structure (main/ipc, main/rclone, main/store, renderer/components, renderer/lib) per plan
- [x] T005 Configure Vitest for main and renderer testing

## Phase 2: Foundation
**Goal**: Implement core architecture for IPC, persistence, and Rclone command execution.

- [x] T006 [P] Implement `src/main/store/index.ts` using electron-store for `settings.json` and `mounts.json` schemas
- [x] T007 [P] Implement `src/main/utils/paths.ts` to define isolated storage paths (`%APPDATA%/CloudMount/`)
- [x] T008 Implement `src/main/rclone/wrapper.ts` skeleton for spawning child processes
- [x] T009 Create `src/contracts/types.ts` shared type definitions from data-model
- [x] T010 Set up `src/main/ipc/index.ts` to register handlers and `src/preload/index.ts` to expose them

## Phase 3: User Story 1 - Initial Setup & Security
**Goal**: Auto-download Rclone, enforce Master Password, and secure configuration.
**Independent Test**: Run on fresh machine; verify Rclone download and password prompt; check `rclone.conf` is encrypted.

- [x] T011 [US1] Implement `src/main/rclone/installer.ts` to download specific Rclone version (v1.65.0)
- [x] T012 [US1] Implement `src/main/utils/winfsp.ts` to detect WinFsp and launch installer
- [x] T013 [US1] Implement `system:check-prereqs` IPC handler in `src/main/ipc/system.ts`
- [x] T014 [US1] Implement `auth:verify-password` IPC handler to validate/set master password in memory
- [ ] T015 [US1] Create `src/renderer/src/components/Onboarding/SetupWizard.svelte` for download progress
- [ ] T016 [US1] Create `src/renderer/src/components/Auth/PasswordPrompt.svelte` for master password entry
- [ ] T017 [US1] Integrate `src/renderer/src/App.svelte` to show Setup or Auth flow on launch

## Phase 4: User Story 2 - Service Management
**Goal**: Add/Edit/List B2 and S3 services via GUI.
**Independent Test**: Add a B2 service; verify it appears in list; verify `rclone.conf` contains the remote.

- [ ] T018 [US2] Implement `src/main/rclone/config.ts` to handle `rclone config` commands
- [ ] T019 [US2] Implement `services:list`, `services:create`, `services:delete` handlers in `src/main/ipc/services.ts`
- [ ] T020 [US2] Implement `services:open-terminal` to launch interactive shell
- [ ] T021 [US2] [P] Create `src/renderer/src/components/Services/ServiceCard.svelte`
- [ ] T022 [US2] [P] Create `src/renderer/src/components/Services/AddServiceForm.svelte` (B2/S3 specific fields)
- [ ] T023 [US2] Create `src/renderer/src/pages/ServiceManager.svelte` to list and manage services

## Phase 5: User Story 3 - Mounting Drives
**Goal**: Mount configured services to Windows drive letters.
**Independent Test**: Mount a service to Z:; verify existence in Explorer; Unmount; verify removal.

- [ ] T024 [US3] Implement `src/main/rclone/mount.ts` to spawn `rclone mount` with `--no-console` and detached flag
- [ ] T025 [US3] Update `src/main/rclone/mount.ts` to track PIDs in `mounts.json` via Store
- [ ] T026 [US3] Implement `mount:start`, `mount:stop`, `mount:list-active` handlers in `src/main/ipc/mount.ts`
- [ ] T027 [US3] Implement logic to detect mount failures (stderr parsing) and emit `mount:status-change`
- [ ] T028 [US3] Create `src/renderer/src/components/Mount/MountModal.svelte` for drive letter selection
- [ ] T029 [US3] Update `ServiceCard.svelte` to show mount status and control buttons

## Phase 6: User Story 4 - System Tray & Persistence
**Goal**: App stays active in tray; mounts persist across restarts.
**Independent Test**: Close window -> Tray icon remains; Restart app -> Mounts restore.

- [ ] T030 [US4] Implement `src/main/tray.ts` for System Tray icon and context menu
- [ ] T031 [US4] Update `src/main/index.ts` to handle window close (minimize to tray) vs quit
- [ ] T032 [US4] Implement `restoreMounts` logic in `src/main/index.ts` on app startup
- [ ] T033 [US4] Implement orphan process cleanup (check PIDs in `mounts.json` on boot)

## Phase 7: User Story 5 - Settings & Polish
**Goal**: Theme switching, Rclone updates, and final UX polish.
**Independent Test**: Switch theme; open Rclone Web UI.

- [ ] T034 [US5] Implement `src/renderer/src/pages/Settings.svelte` with Theme switcher
- [ ] T035 [US5] Implement "Open Web UI" button launching default browser
- [ ] T036 [P] [US5] Add Spanish translations/labels for all UI text (hardcoded or simple i18n object)
- [ ] T037 [US5] Final e2e manual verification pass (WinFsp install, Mount, Unmount, Quit)

## Implementation Strategy
- **MVP First**: Focus on B2/S3 mounting.
- **Security**: Ensure master password is never written to disk.
- **Process Management**: Use `child_process.spawn` with `detached: true` and `stdio: 'ignore'` for mounts.
