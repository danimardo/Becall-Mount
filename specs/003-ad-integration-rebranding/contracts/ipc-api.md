# IPC API Contract: AD Integration

## Namespace: `ad` (Active Directory)

### `ad:syncInfo`
Ejecuta el comando PowerShell para obtener los datos del usuario.
- **Returns**: `Promise<DomainInfo | null>`
- **Errors**: `AD_MODULE_MISSING`, `DOMAIN_UNREACHABLE`, `PERMISSION_DENIED`

### `ad:installRsat`
Solicita elevación para instalar las herramientas de AD.
- **Returns**: `Promise<{ success: boolean, message: string }>`

### `ad:importConfigs`
Escanea carpetas internas y externas para importar remotos `.conf`.
- **Args**: `customPath?: string`
- **Returns**: `Promise<{ imported: number, conflicts: string[] }>`

## Namespace: `auth` (Updates)

### `auth:enableAutologin`
Guarda la contraseña maestro actual de forma segura vinculada a AD.
- **Args**: `{ masterPassword: string }`
- **Returns**: `Promise<void>`

### `auth:tryAutologin`
Intenta desbloquear la aplicación con la contraseña guardada.
- **Returns**: `Promise<boolean>`

### `auth:logout`
Cierra la sesión y deshabilita temporalmente el autologin hasta el próximo reinicio.
- **Returns**: `Promise<void>`
