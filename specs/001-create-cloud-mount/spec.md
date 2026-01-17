# Feature Specification: Cloud Mount MVP

**Feature Branch**: `001-create-cloud-mount`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description provided in Spanish (Cloud Mount - Historias de Usuario)

## Clarifications

### Session 2026-01-17
- Q: Where should the Rclone configuration file be stored? -> A: Isolated Location (`%APPDATA%/CloudMount/rclone.conf`) to ensure this application's settings do not interfere with any existing system-wide Rclone installation.
- Q: How should the WinFsp dependency be handled? -> A: Download & Launch. The application will detect if WinFsp is missing, download the installer, and launch it to guide the user through the process.
- Q: What happens to active mounts when the user fully exits the application? -> A: Silent Disconnect. Mount processes remain active in the background; the application UI process terminates without killing them.
- Q: How should the system handle a mount failure due to invalid credentials? -> A: Prompt for Credentials. Show a clear error in Spanish and allow the user to immediately update the service configuration.
- Q: Which Rclone version should be downloaded? -> A: Static Version Pinning. Use a verified stable version (e.g., v1.65.0) to ensure compatibility with the UI's command-line generation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Setup & Security (Priority: P1)

As a first-time user, I want the application to automatically set up the environment (Rclone) and enforce security (Master Password) so that I can use the tool safely without manual configuration.

**Why this priority**: Without Rclone and a secure configuration, the application cannot function safely or at all. This is the prerequisite for all other features.

**Independent Test**:
1. Run application on a clean machine (no Rclone).
2. Verify Rclone is downloaded automatically with progress indication.
3. Verify application prompts for a Master Password creation.
4. Verify `rclone.conf` is created and encrypted.

**Acceptance Scenarios**:

1. **Given** Rclone is missing, **When** application starts, **Then** show download progress and install Rclone.
2. **Given** no existing configuration, **When** Rclone is ready, **Then** force user to set a Master Password.
3. **Given** existing unencrypted config, **When** application starts, **Then** force user to encrypt it with a Master Password.
4. **Given** application restart, **When** opening, **Then** prompt for Master Password (unless "Remember" was selected).

---

### User Story 2 - Service Management (Priority: P1)

As a user, I want to add, edit, and view my cloud storage services (specifically Backblaze B2 and Amazon S3) through a simple GUI so that I don't have to use the command line.

**Why this priority**: Users need to configure their storage providers before they can mount them.

**Independent Test**:
1. Add a B2 service via the form.
2. Add an S3 service via the form.
3. Verify services appear in the list with correct icons.
4. Verify credentials are validated before saving.

**Acceptance Scenarios**:

1. **Given** "Add Service" clicked, **When** B2 or S3 selected, **Then** show a specific form with required fields (Keys, Endpoint, etc.).
2. **Given** invalid credentials, **When** saving, **Then** show an error message and do not save.
3. **Given** other service types, **When** selected, **Then** open Rclone interactive config in a terminal.
4. **Given** existing service, **When** editing, **Then** allow credential updates (only if unmounted).
5. **Given** a service, **When** deleting, **Then** ask for confirmation and remove it (unmounting first if needed).

---

### User Story 3 - Mounting Drives (Priority: P1)

As a user, I want to mount my cloud storage services as Windows drive letters so that I can access files via File Explorer.

**Why this priority**: This is the core value proposition of the application.

**Independent Test**:
1. Select a configured service.
2. Choose a drive letter (e.g., Z:).
3. Click Mount.
4. Verify Z: appears in Windows Explorer.
5. Click Unmount and verify Z: disappears.

**Acceptance Scenarios**:

1. **Given** a service, **When** "Mount" clicked, **Then** allow selecting an available drive letter (excluding C:).
2. **Given** a mount request, **When** processing, **Then** show "Connecting..." status.
3. **Given** a successful mount, **When** complete, **Then** update status to "Mounted" and show the drive letter.
4. **Given** a specific sub-folder requirement, **When** mounting, **Then** allow specifying a path within the bucket.
5. **Given** a mounted service, **When** "Unmount" clicked, **Then** disconnect the drive and update status.

---

### User Story 4 - System Tray & Persistence (Priority: P2)

As a user, I want the application to run in the background and persist my mounts so that I don't have to re-configure them every time.

**Why this priority**: Ensures seamless daily usage without keeping a window open.

**Independent Test**:
1. Mount a drive.
2. Close the main window.
3. Verify drive remains mounted and app is in System Tray.
4. Reboot/Restart app.
5. Verify app restores previous mount state.

**Acceptance Scenarios**:

1. **Given** app is running, **When** window closed (X), **Then** minimize to System Tray (do not exit).
2. **Given** app in tray, **When** right-clicked, **Then** show menu (Open, Mount All, Unmount All, Exit).
3. **Given** app exit requested via Tray, **When** confirming, **Then** unmount drives (optional/check logic) and terminate process.
4. **Given** app restart, **When** authenticated, **Then** attempt to re-mount previously active drives.

---

### User Story 5 - Settings & Advanced Features (Priority: P3)

As an advanced user, I want to customize the application (Theme, Password) and access advanced Rclone features.

**Why this priority**: Adds polish and supports power users, but not critical for basic functionality.

**Independent Test**:
1. Change theme to Dark.
2. Open Rclone Web UI.
3. Update Rclone.

**Acceptance Scenarios**:

1. **Given** settings, **When** theme changed, **Then** update UI immediately (Light/Dark/System).
2. **Given** advanced menu, **When** "Web UI" clicked, **Then** open Rclone Web UI in default browser.
3. **Given** updates available, **When** "Update Rclone" clicked, **Then** download and update binary.

### Edge Cases

- **No Internet Connection during Setup**:
  - If internet is unavailable during the initial Rclone download, the application must display a clear error message and a "Retry" button. It should not crash or proceed with a broken state.
- **Missing WinFsp Dependency**:
  - Rclone 'mount' on Windows usually requires WinFsp. If the mount command fails due to missing dependencies, the application should inform the user and provide a link or instruction to install WinFsp.
- **Drive Letter Conflict**:
  - If a saved drive letter (e.g., Z:) is occupied by another device (USB, Network) when mounting, the application should warn the user and offer to select a different letter.
- **Rclone Process Termination**:
  - If the background Rclone process is killed externally (Task Manager), the application should detect this state change and update the UI to "Unmounted" to reflect reality.
- **Corrupt Configuration**:
  - If the encrypted config file cannot be decrypted (wrong password or corruption), the application should allow the user to retry the password or offer to reset the configuration (warning about data loss).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically download a specific verified version of the `rclone` binary (e.g., v1.65.0) if not found at startup.
- **FR-013**: System MUST detect the presence of WinFsp and, if missing, download and launch the WinFsp installer.
- **FR-014**: System MUST ensure Rclone mount processes remain active even if the main application UI process is terminated.
- **FR-015**: System MUST detect mount failures due to authentication errors and prompt the user to update service credentials via a UI dialog.
- **FR-002**: System MUST enforce Rclone configuration encryption using a Master Password.
- **FR-003**: System MUST provide a GUI form for configuring Backblaze B2 and Amazon S3 services.
- **FR-004**: System MUST launch an interactive terminal for configuring unsupported Rclone services.
- **FR-005**: System MUST allow mounting services to specific Windows drive letters (A-Z, excluding C).
- **FR-006**: System MUST support mounting specific sub-paths/buckets.
- **FR-007**: System MUST minimize to the System Tray on window close, keeping mounts active.
- **FR-008**: System MUST persist mount states and attempt to restore them on application restart.
- **FR-009**: System MUST NOT require Administrator privileges for installation or basic operation.
- **FR-010**: System MUST display all interface text and error messages in Spanish.
- **FR-011**: System MUST store all data (including `rclone.conf`) in a dedicated isolated directory (`%APPDATA%/CloudMount/`) and never expose credentials in plain text logs.
- **FR-012**: System MUST allow mounting the same service multiple times to different letters/paths.

### Key Entities

- **ServiceConfig**: Represents a cloud provider configuration (Name, Type, encrypted credentials).
- **MountState**: Represents an active mount (Service ID, Drive Letter, Local Path, Remote Path, PID).
- **AppConfig**: User preferences (Theme, Master Password Hash/Salt, Rclone Binary Path).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application startup time (interactive ready state) is under 5 seconds (excluding initial download).
- **SC-002**: Users can mount a configured service in 2 clicks or fewer.
- **SC-003**: 100% of Rclone configuration files are encrypted on disk.
- **SC-004**: Application successfully handles basic mount/unmount operations without Administrator elevation.