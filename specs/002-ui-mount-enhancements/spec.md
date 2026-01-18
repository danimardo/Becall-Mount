## Technical Implementation Details

### Splash Screen Logic
- **Process**: Created in `main.ts` before `mainWindow`.
- **Timing**: `Math.max(0, 3000 - elapsed_load_time)` used to delay `splash.close()`. Waits for `ready-to-show` event.
- **Window**: `frame: false`, `transparent: true`, `alwaysOnTop: true`, `width: 640`, `height: 360`.

### Configuration Encryption
- **Method**: Automated interaction via `rclone config encryption set` on startup if plaintext detected.
- **Algorithm**: Rclone native encryption.
- **Key Derivation**: Managed by Rclone internally.
- **File Format**: Standard Rclone encrypted config.

### Folder Mounting
- **Command**: `rclone mount remote:path "C:\Local\Path" --vfs-cache-mode full`
- **Validation**: Strict check: Target folder MUST NOT exist. Parent folder MUST exist.
- **Persistence**: Preferences stored in `electron-store`.

### UI Architecture
- **Palette**: defined in `tailwind.config.js` under `colors.brand`.
- **Icons**: Use existing icon set, updated to be circular/floating where specified.
- **Modals**: Custom DaisyUI dialogs replacing native `alert`/`confirm` for consistent theming.
