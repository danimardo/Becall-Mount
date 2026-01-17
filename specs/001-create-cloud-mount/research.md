# Research & Findings: Cloud Mount

**Feature**: 001-create-cloud-mount
**Date**: 2026-01-17

## 1. Rclone Integration for Windows

**Goal**: Seamless mounting and detached process management.

### Mounting on Windows
Rclone uses WinFsp to mount drives on Windows.
- **Command**: `rclone mount remote:path X: --vfs-cache-mode full`
- **Critical Flags**:
  - `--vfs-cache-mode full`: Essential for Windows Explorer compatibility (avoids errors with file opens).
  - `--volname "Name"`: Sets the drive label in Explorer.
  - `--no-console`: Hides the console window (crucial for detached background process).
  - `--rc`: Enables Remote Control API (allows checking status/unmounting cleanly later via HTTP if needed, though PID tracking is simpler for MVP).

### Detached Processes in Node.js
To ensure mounts survive app exit (FR-014), we must spawn the process detached and unref it.
```typescript
const subprocess = spawn(rclonePath, args, {
  detached: true,
  stdio: 'ignore' // or open a log file fd
});
subprocess.unref(); // Allows parent to exit without waiting
```
**Finding**: This matches the "Silent Disconnect" requirement. We need to store the `subprocess.pid` in `mounts.json` to check if it's still alive later using `process.kill(pid, 0)`.

## 2. Security & Encryption

**Goal**: Secure `rclone.conf` without reinventing encryption.

### Rclone Configuration Encryption
Rclone has built-in encryption for its config file.
- **Mechanism**: Obfuscation (weak) by default, but strong AES when a `configuration password` is set.
- **Implementation**:
  - We will set the `RCLONE_CONFIG_PASS` environment variable when spawning any rclone command.
  - This password is the "Master Password" the user creates.
  - **Storage**: The Master Password itself is **NOT** stored on disk (user enters it on boot). We might store a salted hash to verify correctness (SC-003).

### IPC Security
Electron `contextIsolation: true` is mandatory.
- **Pattern**: `ipcMain` handles logic, `ipcRenderer` (via `preload.js`) exposes specific API methods.
- **Secrets**: Passwords should pass from Renderer to Main via `invoke` and stay in Main's memory (variable), never sent back to Renderer or logged.

## 3. WinFsp Installer

**Goal**: "Download & Launch" (FR-013).

- **Detection**: Check for `C:\Program Files (x86)\WinFsp\bin\launcher-x64.dll` or registry key `HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\WinFsp`.
- **Installer**: Download the `.msi` from GitHub releases.
- **Launch**: `shell.openPath(installerPath)` triggers the standard Windows installer UI (with UAC). We cannot silently install without Admin, so standard UI is correct per Spec.

## 4. Project Structure (Electron Forge + Svelte)

Standard boilerplate structure:
```text
src/
  main/
    index.ts          # Entry point
    rclone-wrapper.ts # Spawning logic
    store.ts          # Persistence (electron-store)
    ipc-handlers.ts   # API definitions
  preload/
    index.ts          # Context bridge
  renderer/
    src/
      App.svelte
      components/
      lib/
```

**Decision**: Use `electron-vite` or standard `electron-forge` with Svelte template. The constitution specifies "Electron Forge".
