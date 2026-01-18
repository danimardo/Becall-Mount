# Data Model: UI & Mount Enhancements

## 1. Mount Persistence (Electron Store)

New schema additions for persisting user mounting preferences per service.

**File**: `config.json` (handled by `electron-store`)

```typescript
interface StoreSchema {
  // ... existing fields
  mountPreferences: Record<string, MountPreference>;
}

interface MountPreference {
  /**
   * The type of mount last used for this service.
   */
  lastMountType: 'drive' | 'folder';

  /**
   * The drive letter (e.g., 'Z') if type is 'drive'.
   */
  lastDriveLetter?: string;

  /**
   * The local folder path (e.g., 'C:\Backups') if type is 'folder'.
   */
  lastFolderPath?: string;
  
  /**
   * Optional remote sub-path (bucket/folder)
   */
  remotePath?: string;
}
```

## 2. Export Package Structure (Encrypted File)

The binary format of the exported `.conf` file.

```typescript
interface ExportPackage {
  /**
   * Random 16-byte salt used for key derivation.
   */
  salt: Buffer;

  /**
   * Random 16-byte Initialization Vector for AES-CBC.
   */
  iv: Buffer;

  /**
   * The encrypted JSON payload containing the Rclone config.
   */
  payload: Buffer;
}

// Payload (after decryption)
interface ExportedConfigPayload {
  version: number; // Schema version (e.g., 1)
  services: Array<{
    name: string;
    type: string;
    params: Record<string, string>;
  }>;
}
```

## 3. Splash Screen State

**Runtime State (Main Process)**

```typescript
interface SplashState {
  window: BrowserWindow | null;
  minDisplayTimePromise: Promise<void>;
  appReadyPromise: Promise<void>;
}
```
