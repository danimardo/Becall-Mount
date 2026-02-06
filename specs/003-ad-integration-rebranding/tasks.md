# Tasks: Integración con Active Directory y Rebranding

**Feature Branch**: `003-ad-integration-rebranding`
**Status**: Initialized
**Plan**: [plan.md](plan.md)

## Phase 1: Setup & Foundational Rebranding
*Goal: Initialize the project with the new brand and ensure data migration for existing users.*

- [x] T001 Update application identity (name, productName, appId) in `package.json`
- [x] T002 Update build configuration and executable name in `forge.config.ts`
- [x] T003 [P] Implement migration utility for moving `%AppData%` content in `src/main/utils/migration.ts`
- [x] T004 Update path resolution to support both old and new brand directories in `src/main/utils/paths.ts`
- [x] T005 [P] Implement unit tests for migration logic in `tests/unit/migration.test.ts`
- [x] T006 [P] Add `infoDominio` and new settings fields to the store schema in `src/contracts/types.ts`

## Phase 2: User Story 3 - Rebranding & Seamless Migration (Priority: P3)
*Goal: Complete the visual and technical rebranding with automated data transfer.*

- [x] T007 [US3] Implement application titles and UI labels rebranding in `renderer/src/App.svelte`
- [x] T008 [US3] Integrate migration service call during application bootstrap in `src/main/main.ts`
- [x] T008b [US3] Implement safe deletion of the old brand directory after verifying migration integrity in `src/main/utils/migration.ts`
- [x] T009 [US3] [P] Create manual test script for verifying rebranding and migration in `specs/003-ad-integration-rebranding/quickstart.md`

## Phase 3: User Story 1 - AD Configuration Automation (Priority: P1)
*Goal: Automatically configure remotes using Active Directory user data.*

- [x] T010 [US1] Implement PowerShell wrapper using `DirectorySearcher` (.NET) to return structured JSON matching the `infoDominio` entity
- [x] T011 [US1] Implement AD connectivity check (RSAT no longer required) in `src/main/ad/sync.ts`
- [x] T012 [US1] [P] Implement variable substitution engine for `.conf` files in `renderer/src/lib/conf-processor.ts`
- [x] T013 [US1] [P] Create unit tests for variable substitution in `tests/unit/conf-processor.test.ts`
- [x] T014 [US1] Implement AD sync and configuration import IPC handlers in `src/main/ipc/ad.ts`
- [x] T015 [US1] [P] Create AD Integration settings component in `renderer/src/components/Settings/ADIntegration.svelte`
- [x] T015b [US1] Implement directory selector and persistence for `adConfPath` in `renderer/src/components/Settings/ADIntegration.svelte`
- [x] T016 [US1] Implement conflict resolution dialog for duplicate remotes in `renderer/src/components/Shared/ConfirmDialog.svelte`

## Phase 4: User Story 2 - Secure Autologin (Priority: P2)
*Goal: Securely store master password and enable automatic unlocking.*

- [x] T017 [US2] Implement secure storage utility using Electron `safeStorage` in `src/main/auth/safe-storage.ts`
- [x] T018 [US2] Implement autologin logic linked to Windows SID in `src/main/ipc/auth.ts`
- [x] T019 [US2] Update authentication flow to support silent unlock on startup in `src/main/main.ts`
- [x] T020 [US2] [P] Add autologin toggle to settings UI in `renderer/src/components/Settings/ADIntegration.svelte`
- [x] T021 [US2] Implement manual logout behavior (suspending autologin) in `src/main/ipc/auth.ts`

## Phase 5: Polish & Verification
*Goal: Final verification and cross-cutting concerns.*

- [x] T022 [P] Review and update "About" section with new branding in `renderer/src/pages/Settings.svelte`
- [x] T023 Final verification of SC-001 to SC-004 metrics in real AD environment
- [x] T024 Perform security audit of master password storage in Windows Credential Manager

## Dependencies
- Phase 1 & 2 (Rebranding) MUST be completed first to establish the new application environment.
- US1 (AD Integration) is the primary functional requirement (P1).
- US2 (Autologin) depends on US1 (`infoDominio` availability).

## Parallel Execution Examples
- **Migration & AD Wrapper**: T003, T005 and T010 can be developed in parallel.
- **UI & Processor**: T012, T013 and T015 can be developed in parallel.
- **Security**: T017 and T024 can be handled together as a security sprint.
