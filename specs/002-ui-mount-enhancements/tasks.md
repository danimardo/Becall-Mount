# Actionable Tasks: UI & Mount System Enhancements

**Branch**: `002-ui-mount-enhancements`
**Status**: Pending
**Spec**: [spec.md](./spec.md)

## Implementation Strategy

We will implement this feature in horizontal slices, starting with the visual foundation (Tailwind) which affects everything, then moving to core functionality (Mounting), and finally auxiliary features (Export/Import, Splash).

1.  **Foundation**: Visual overhaul first to ensure all new components use the correct palette.
2.  **Core**: Advanced mounting logic (Drive/Folder) as it's the primary user value.
3.  **Auxiliary**: Export/Import and Splash screen are independent features.

## Phase 1: Setup & Foundation (P0)

**Goal**: Establish the new visual identity and prepare the project structure.

- [x] T001 Define corporate color palette in `tailwind.config.js`
- [x] T002 Update `src/index.css` to use brand colors for base styles (backgrounds, text)
- [x] T003 Create `src/main/ipc/config-transfer.ts` structure (empty export/import functions)
- [x] T004 Create `src/renderer/src/lib/crypto.ts` structure (empty encryption functions)
- [x] T005 [P] Create `src/renderer/src/components/Shared/FAB.svelte` component structure
- [x] T006 [P] Create `src/renderer/src/components/Splash/SplashScreen.svelte` component structure

## Phase 2: UI Redesign & Branding (US1 - P1)

**Goal**: Implement the new modern interface with FAB and corporate colors.

- [x] T007 [US1] Update `src/renderer/src/pages/ServiceManager.svelte` layout to remove old "Add" button and add FAB container
- [x] T008 [US1] Implement `FAB.svelte` logic and styling (floating bottom-right)
- [x] T009 [US1] Update `src/renderer/src/components/Services/ServiceCard.svelte` to use new brand colors/shadows
- [x] T010 [US1] Update Footer buttons in `ServiceManager.svelte` to be round icons (Settings, About)
- [x] T011 [US1] Implement "About" modal logic in `src/renderer/src/pages/ServiceManager.svelte`
- [x] T012 [US1] Ensure dynamic version reading in About modal (from `package.json` context)

## Phase 3: Advanced Mounting System (US2 - P1)

**Goal**: Allow mounting to both drive letters and local folders with persistence.

**Backend (Main Process)**:
- [x] T013 [US2] Update `src/main/rclone/mount.ts` to accept `target` path instead of just `driveLetter`
- [x] T014 [US2] Implement folder validation logic in `src/main/rclone/mount.ts` (exists + empty check)
- [x] T015 [US2] Update `mount:start` handler in `src/main/ipc/mount.ts` to handle new payload structure
- [x] T016 [US2] Update `MountManager` class to persist preferences using `electron-store`

**Frontend (Renderer)**:
- [x] T017 [US2] Update `src/renderer/src/components/Mount/MountModal.svelte` to support Tabs (Drive vs Folder)
- [x] T018 [US2] Implement "Mount to Folder" tab UI with path input and browse button
- [x] T019 [US2] Connect browse button to Electron `dialog.showOpenDialog` via IPC
- [x] T020 [US2] Implement mutual exclusivity logic in `MountModal.svelte`
- [x] T021 [US2] Handle "Folder Not Empty" warning confirmation flow

## Phase 4: Mass Unmount (US3 - P2)

**Goal**: One-click unmount for all services.

- [x] T022 [US3] Implement `mount:stop-all` handler in `src/main/ipc/mount.ts`
- [x] T023 [US3] Update `MountManager.unmountAll()` logic to iterate and stop processes
- [x] T024 [US3] Add "Unmount All" button to Header in `src/renderer/src/pages/ServiceManager.svelte`
- [x] T025 [US3] Implement confirmation dialog and success notification for mass unmount

## Phase 5: Configuration Export/Import (US4 - P2)

**Goal**: Securely backup and restore service configurations.

**Lib & IPC**:
- [x] T026 [P] [US4] Implement AES-256 encryption/decryption in `src/renderer/src/lib/crypto.ts` (or main process equivalent if preferred)
- [x] T027 [US4] Implement `config:export` logic in `src/main/ipc/config-transfer.ts` (File save dialog + write)
- [x] T028 [US4] Implement `config:import` logic in `src/main/ipc/config-transfer.ts` (File read + parse + conflict check)

**UI**:
- [x] T029 [US4] Update Settings modal to include "Export Config" and "Import Config" buttons
- [x] T030 [US4] Implement "Export" flow UI (Select Services -> Password -> Save)
- [x] T031 [US4] Implement "Import" flow UI (Select File -> Password -> Conflict Resolution)

## Phase 6: Splash Screen (US5 - P3)

**Goal**: Professional startup experience.

- [x] T032 [US5] Implement `src/renderer/src/components/Splash/SplashScreen.svelte` layout and animation
- [x] T033 [US5] Create `src/renderer/pages/splash.html` entry point
- [x] T034 [US5] Update `src/main/main.ts` to create Splash Window on launch
- [x] T035 [US5] Implement timing logic (Promise.all) in `src/main/main.ts` to ensure 2s minimum display
- [x] T036 [US5] Implement fade-out and close logic when Main Window is ready

## Phase 7: Polish & Verification

- [x] T037 Verify all new colors meet accessibility contrast ratios
- [x] T038 Test full "Mount to Folder" flow on Windows with spaces in path
- [x] T039 Test "Export/Import" flow with a fresh install simulation
- [x] T040 Verify Splash Screen version matches `package.json`

## Dependencies

1.  **Phase 1 (Foundation)** blocks everything.
2.  **Phase 2 (UI)** is required for Phase 3 and 4 UI components.
3.  **Phase 3 (Mounting)** and **Phase 5 (Config)** are independent logic-wise but share the UI foundation.
4.  **Phase 6 (Splash)** is completely independent.
