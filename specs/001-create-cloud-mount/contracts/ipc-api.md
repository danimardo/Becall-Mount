# IPC API Contract

Defines the `ipcMain` handlers and `ipcRenderer` (contextBridge) methods.

## Namespace: `api`

### Auth & System
| Channel | Type | Payload | Response | Description |
|---------|------|---------|----------|-------------|
| `system:check-prereqs` | Invoke | `void` | `{ rclone: boolean, winfsp: boolean }` | Check dependencies. |
| `system:install-rclone` | Invoke | `void` | `void` | Triggers download. Events emit progress. |
| `system:install-winfsp` | Invoke | `void` | `void` | Launches installer. |
| `auth:verify-password` | Invoke | `{ password: string }` | `boolean` | Verifies or sets master password. |

### Services
| Channel | Type | Payload | Response | Description |
|---------|------|---------|----------|-------------|
| `services:list` | Invoke | `void` | `Service[]` | List configured remotes. |
| `services:create` | Invoke | `ServiceConfig` | `void` | Create new remote via `rclone config`. |
| `services:delete` | Invoke | `{ name: string }` | `void` | Delete remote. |
| `services:open-terminal` | Invoke | `void` | `void` | Open interactive config terminal. |

### Mounting
| Channel | Type | Payload | Response | Description |
|---------|------|---------|----------|-------------|
| `mount:start` | Invoke | `MountConfig` | `void` | Start mount process. |
| `mount:stop` | Invoke | `{ driveLetter: string }` | `void` | Stop mount process. |
| `mount:list-active` | Invoke | `void` | `MountState[]` | Get running mounts. |

### Events (Main -> Renderer)
- `rclone:download-progress`: `{ percent: number }`
- `mount:status-change`: `{ service: string, status: 'connecting'|'mounted'|'error', error?: string }`
