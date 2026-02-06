# Data Model: Becall-Mount

## 1. File Storage
All files stored in `%APPDATA%/becall-mount/`.

### `settings.json`
General application preferences.
```json
{
  "theme": "system", // "light" | "dark" | "system"
  "rclonePath": "bin/rclone.exe",
  "firstRun": false,
  "passwordHash": "argon2..." // To verify Master Password on login
}
```

### `mounts.json`
Tracks active background processes.
```json
[
  {
    "serviceName": "MyBackblaze",
    "driveLetter": "Z",
    "pid": 12345,
    "startTime": "2026-01-17T10:00:00Z",
    "status": "mounted" // "mounted" | "error" | "unmounted"
  }
]
```

## 2. Rclone Configuration (`rclone.conf`)
Managed by Rclone binary, encrypted.
Internal structure (when decrypted via Rclone CLI/API):
```ini
[MyBackblaze]
type = b2
account = ...
key = ...
hard_delete = true

[MyS3]
type = s3
provider = AWS
access_key_id = ...
secret_access_key = ...
region = us-east-1
```

## 3. Frontend Types (TypeScript)

### `Service`
```typescript
interface Service {
  name: string;
  type: 'b2' | 's3' | 'drive' | 'dropbox' | 'other';
  icon: string;
  isMounted: boolean;
  mountPoint?: string; // e.g., "Z:"
}
```

### `MountConfig`
```typescript
interface MountConfig {
  serviceName: string;
  driveLetter: string; // "A" - "Z"
  subPath?: string; // Optional remote path
}
```

### `AppState`
```typescript
interface AppState {
  isAuthenticated: boolean; // Master password entered
  isRcloneInstalled: boolean;
  isWinFspInstalled: boolean;
  services: Service[];
  activeMounts: MountConfig[];
}
```
