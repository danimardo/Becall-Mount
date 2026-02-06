# Feature Specification: Becall-Mount MVP

**Feature Branch**: `001-create-becall-mount`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description provided in Spanish (Becall-Mount - Historias de Usuario)

## Clarifications

### Session 2026-01-17
- Q: Where should the Rclone configuration file be stored? -> A: Isolated Location (`%APPDATA%/becall-mount/rclone.conf`) to ensure this application's settings do not interfere with any existing system-wide Rclone installation.
- Q: How should the WinFsp dependency be handled? -> A: Download & Launch. The application will detect if WinFsp is missing, download the installer, and launch it to guide the user through the process.
- Q: What happens to active mounts when the user fully exits the application? -> A: Silent Disconnect. Mount processes remain active in the background; the application UI process terminates without killing them.
- Q: How should the system handle a mount failure due to invalid credentials? -> A: Prompt for Credentials. Show a clear error in Spanish and allow the user to immediately update the service configuration.
- Q: Which Rclone version should be downloaded? -> A: Static Version Pinning. Use a verified stable version (e.g., v1.72.1) to ensure compatibility with the UI's command-line generation.

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
5. **Given** new Rclone version available, **When** 30 days passed since last check, **Then** auto-update silently on startup.

---

### User Story 2 - Service Management (Priority: P1)

As a user, I want to add, edit, and view my cloud storage services (specifically Backblaze B2 and Amazon S3) through a simple GUI so that I don't have to use the command line.

**Why this priority**: Users need to configure their storage providers before they can mount them.

**Implementation Note**: The application uses a dynamic JSON-based configuration system. Service form fields are not hardcoded but loaded from `remotes-schema.json`, making it easy to add new services without code changes.

**Independent Test**:
1. Add a B2 service via the form.
2. Add an S3 service via the form.
3. Verify services appear in the list with correct icons.
4. Verify credentials are validated before saving.
5. Verify form fields are dynamically generated from JSON schema.
6. Verify required fields show red asterisk (*) indicator.
7. Verify validation prevents creation when required fields are empty.
8. Verify S3 requires bucket field, B2 bucket is optional.
9. Verify service icons from schema are displayed correctly.

**Acceptance Scenarios**:

1. **Given** "Add Service" clicked, **When** B2 or S3 selected, **Then** show a dynamically generated form with required fields from schema.
2. **Given** invalid credentials, **When** saving, **Then** show an error message and do not save.
3. **Given** other service types, **When** selected, **Then** open Rclone interactive config in a terminal.
4. **Given** existing service, **When** editing, **Then** show form with name/type locked and other fields editable (only if unmounted).
5. **Given** a service, **When** deleting, **Then** ask for confirmation and remove it (unmounting first if needed).
6. **Given** required field empty, **When** clicking "Create" or "Save Changes", **Then** show validation error with field name and red asterisk indicator.
7. **Given** S3 service configuration, **When** bucket field is filled, **Then** service will mount directly to that specific bucket.
8. **Given** B2 service configuration, **When** bucket field is empty, **Then** service can access all buckets (optional field).
9. **Given** service with path specified, **When** mounted, **Then** directly access the specified sub-path within bucket.

**Technical Implementation**:

**Service Editing**:
- **Backend IPC**:
  - `services:get`: Retrieves existing remote configuration.
  - `services:update`: Overwrites an existing remote configuration with new parameters.
- **Frontend Flow**:
  - `ServiceCard` provides an "Editar" button (disabled if `isMounted` is true).
  - `ServiceManager` manages `serviceToEdit` state.
  - `AddServiceForm` reuses the creation UI in "Edit Mode":
    - Locks `name` and `type` fields.
    - Loads current configuration into `params` on mount.
    - Updates UI text to "Editar Servicio" and "Guardar Cambios".
    - Uses `services:update` for saving.


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

- **FR-001**: System MUST automatically download a specific verified version of the `rclone` binary (e.g., v1.72.1) if not found at startup.
- **FR-013**: System MUST detect the presence of WinFsp. If missing, it MUST download and launch the installer and use a background polling mechanism (2-second interval) to automatically detect when the installation is complete.
- **FR-014**: System MUST ensure Rclone mount processes remain active even if the main application UI process is terminated.
- **FR-015**: System MUST detect mount failures due to authentication errors and prompt the user to update service credentials via a UI dialog.
- **FR-002**: System MUST enforce Rclone configuration encryption using a robust Master Password (minimum 8 characters, including uppercase, lowercase, numbers, and special characters). System MUST require double-entry confirmation during the initial setup process.
- **FR-003**: System MUST provide a GUI form for configuring services, with form fields dynamically generated from a JSON schema (`remotes-schema.json`).
- **FR-003.1**: System MUST support adding new service types by modifying the JSON schema without code changes.
- **FR-003.2**: System MUST apply default values from schema automatically when creating services.
- **FR-003.3**: System MUST support hidden configuration fields (e.g., `type`, `provider`) that are submitted but not displayed in forms.
- **FR-003.4**: System MUST render appropriate input types based on schema field definitions (text, password, select).
- **FR-004**: System MUST launch an interactive terminal for configuring unsupported Rclone services.
- **FR-005**: System MUST allow mounting services to specific Windows drive letters (A-Z, excluding C and any currently occupied by the OS).
- **FR-005.1**: System MUST dynamically filter available drive letters in the UI by querying the operating system.
- **FR-005.2**: System MUST perform a final availability check of the drive letter immediately before initiating the mount process.
- **FR-006**: System MUST support mounting specific sub-paths/buckets.
- **FR-007**: System MUST minimize to the System Tray on window close, keeping mounts active.
- **FR-008**: System MUST persist mount states and attempt to restore them on application restart.
- **FR-009**: System MUST NOT require Administrator privileges for installation or basic operation.
- **FR-010**: System MUST display all interface text and error messages in Spanish.
- **FR-011**: System MUST store all data (including `rclone.conf`) in a dedicated isolated directory (`%APPDATA%/becall-mount/`) and never expose credentials in plain text logs.
- **FR-012**: System MUST allow mounting the same service multiple times to different letters/paths.
- **FR-016**: System MUST periodically (monthly) check for updates to the underlying `rclone` binary and automatically update it if a newer version is available.
- **FR-017**: System MUST support importing Service Account JSON files for Google Cloud Storage by embedding their content directly into the encrypted configuration, preventing plain-text credential files from remaining on disk.
- **FR-018**: System MUST enforce that the `bucket` field is mandatory for Google Cloud Storage services to ensure correct mounting.
- **FR-019**: System MUST automatically set a custom icon (.ico) and label for mounted drive letters in the Windows Explorer via the `HKCU` registry.
- **FR-020**: System MUST automatically remove drive-specific registry customizations when a drive is unmounted to maintain system cleanliness.
- **FR-021**: System MUST allow users to enable/disable automatic application launch at Windows startup through the settings menu using the `app.setLoginItemSettings` API.
- **FR-022**: System MUST automatically re-mount all previously active cloud units after the user provides the Master Password (or if the session is already authenticated).
- **FR-023**: System MUST provide a mechanism to test service connectivity before saving the configuration, creating a temporary remote and executing a lightweight `lsd` command to verify credentials.
- **FR-024**: System MUST support Azure Blob Storage using account credentials, ensuring the access key is automatically obscured before saving.
- **FR-025**: System MUST support SFTP, FTP, and FTPS protocols, including advanced compatibility settings like `shell_type` and `subsystem` overrides.
- **FR-026**: System MUST allow extending the Splash Screen duration by 5 seconds upon user click, using an IPC event to delay the main window transition.
- **FR-027**: System MUST persist the main window's dimensions and screen coordinates, restoring them upon application launch.
  - Default window size on first run: **813 x 952 pixels**.
- **FR-028**: System MUST provide a conflict resolution mechanism during configuration import, allowing users to rename (with custom name) or overwrite existing services.
- **FR-029**: System MUST allow configuring advanced per-service mount flags via a UI section that visually highlights itself when custom settings are active.
- **FR-030**: System MUST display the list of configured services sorted alphabetically by name.
- **FR-031**: System MUST provide an integrated help modal explaining the purpose and default values of all advanced mount parameters to assist users in configuration.
- **FR-032**: System MUST only display the "Desmontar Todos" action button when there is at least one active mount point detected.

### Key Entities

- **ServiceConfig**: Represents a cloud provider configuration (Name, Type, encrypted credentials).
- **MountState**: Represents an active mount (Service ID, Drive Letter, Local Path, Remote Path, PID).
- **AppConfig**: User preferences (Theme, Master Password Hash/Salt, Rclone Binary Path, Last Driver Update Check).
- **RemotesSchema**: JSON schema defining available service types and their configuration field structure.
- **RemoteSchema**: Schema for a single service type (name, type, config fields).
- **RemoteFieldConfig**: Configuration for a single field (label, type, required, placeholder, value, hidden).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application startup time (interactive ready state) is under 5 seconds (excluding initial download).
- **SC-002**: Users can mount a configured service in 2 clicks or fewer.
- **SC-003**: 100% of Rclone configuration files are encrypted on disk.
- **SC-004**: Application successfully handles basic mount/unmount operations without Administrator elevation.
## Technical Implementation Details

### Service Editing
- **Backend IPC**:
  - `services:get`: Retrieves existing remote configuration via `config dump`.
  - `services:update`: Overwrites an existing remote configuration with new parameters.
- **Frontend Flow**:
  - `ServiceCard` provides an "Editar" button (enabled only if `isMounted` is false).
  - `ServiceManager` manages `serviceToEdit` state.
  - `AddServiceForm` reuses the creation UI in "Edit Mode":
    - Locks `name` and `type` fields.
    - Loads current configuration into `params` on mount and correctly maps fields.
    - Uses `bind:value` to ensure all editable fields are pre-filled with existing information.
    - Updates UI text to "Editar Servicio" and "Guardar Cambios".

### Importación de Configuraciones (Google JSON)
- **Flujo de Usuario**:
  - El usuario selecciona la pestaña "Importar Archivo" en el modal de creación.
  - Selecciona un archivo `.json` de Service Account.
  - El sistema extrae el contenido y muestra un aviso instando a borrar el archivo original.
- **Proceso Interno**:
  - El contenido íntegro del JSON se guarda en el parámetro `service_account_credentials` de rclone.
  - Al estar el archivo `rclone.conf` encriptado con contraseña maestra, las credenciales quedan protegidas por AES-256 automáticamente.
  - No se almacenan copias del archivo JSON en el disco duro del usuario.
  - Se activa `bucket_policy_only` por defecto para compatibilidad con GCS.

### Personalización Visual de Unidades
- **Objetivo**: Mejorar la integración con el sistema mostrando iconos y nombres descriptivos en el Explorador.
- **Resolución de Iconos**:
  - El sistema extrae el nombre base del icono definido en el esquema (ej. de `google.webp` extrae `google`).
  - Busca el archivo equivalente con extensión `.ico` en las carpetas de recursos de la aplicación.
- **Modificaciones de Registro**:
  - Se utilizan claves en `HKEY_CURRENT_USER\Software\Classes\Applications\explorer.exe\Drives\{LETRA}`.
  - `DefaultIcon`: Ruta al archivo `.ico`.
  - `DefaultLabel`: Nombre personalizado del servicio.
- **Limpieza**: Al ejecutar el comando de desmontaje, se elimina la clave de registro correspondiente a esa letra de unidad para evitar que personalizaciones antiguas afecten a unidades físicas conectadas posteriormente.

### Drive Availability Detection
- **Logic**:
  - The system executes `wmic logicaldisk get name` to identify letters already in use by Windows (Local disks, Network drives, USB).
  - It cross-references this with internal `mountManager` state to account for active cloud mounts.
  - The UI (`MountModal`) only renders letters that pass both checks.
- **Validation**:
  - A double-check is performed in the `mount` method in the main process to prevent race conditions if a drive becomes occupied between selection and execution.