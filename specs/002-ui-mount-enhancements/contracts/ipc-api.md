# IPC API Contracts: UI & Mount Enhancements

## Config Transfer

### `config:export`
**Type**: Invoke (Promise)
**Direction**: Renderer -> Main
**Description**: Exports selected services to an encrypted file.

**Request**:
```typescript
{
  serviceNames: string[]; // List of service names to export
  password: string;       // User-provided encryption password
}
```

**Response**:
```typescript
{
  success: boolean;
  filePath?: string;      // Where the file was saved
  error?: string;
}
```

### `config:import`
**Type**: Invoke (Promise)
**Direction**: Renderer -> Main
**Description**: Imports services from a file.

**Request**:
```typescript
{
  filePath: string;
  password?: string;      // Required if file is encrypted
}
```

**Response**:
```typescript
{
  success: boolean;
  servicesImported: number;
  conflicts: Array<{      // List of services that already exist
    name: string;
    type: string;
  }>;
  error?: string;         // e.g., "Invalid password"
}
```

## System / Splash

### `app:ready`
**Type**: Send (Event)
**Direction**: Main -> Renderer
**Description**: Signals that the backend is fully initialized (config loaded, etc.). Used by the renderer to know when to start rendering the main UI, effectively triggering the splash screen close sequence in the Main process.

*(Note: Splash screen logic is mostly handled internally in Main, but the Renderer needs to signal when it's visually ready)*

## Mount Management (Updates)

### `mount:start` (Updated)
**Request** (Expanded):
```typescript
{
  serviceName: string;
  mountType: 'drive' | 'folder';
  target: string;         // 'Z' or 'C:\Path'
  remotePath?: string;    // Optional sub-path
}
```

### `mount:stop-all`
**Type**: Invoke (Promise)
**Direction**: Renderer -> Main
**Description**: Unmounts all currently active services.

**Response**:
```typescript
{
  success: boolean;
  unmountedCount: number;
  errors: string[];       // List of service names that failed to unmount
}
```
