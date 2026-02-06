# Data Model: AD Integration & Rebranding

## Entities

### infoDominio (Store)
Almacena los datos recuperados de Active Directory para el usuario actual.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `SamAccountName` | string | Identificador único del usuario en el dominio (ej: `daniel.mardomingo`). |
| `DisplayName` | string | Nombre completo para mostrar. |
| `EmailAddress` | string | Correo electrónico principal. |
| `DistinguishedName` | string | Ruta completa LDAP del objeto usuario. |
| `Department` | string | Departamento del usuario. |
| `Title` | string | Cargo o puesto. |
| `MemberOf` | string[] | Lista de grupos de AD a los que pertenece. |
| `lastUpdated` | string (ISO) | Fecha de la última sincronización con AD. |

### Configuración (Store Updates)

| Campo | Tipo | Valor por defecto | Descripción |
|-------|------|-------------------|-------------|
| `adIntegrationEnabled` | boolean | `false` | Activa/desactiva la integración con AD. |
| `adConfPath` | string | `""` | Ruta externa opcional para buscar archivos `.conf`. |
| `autologinEnabled` | boolean | `false` | Determina si se debe intentar el desbloqueo automático. |

## Variables de Plantilla (.conf)
Variables soportadas para sustitución en archivos de configuración de rclone:
- `%SamAccountName%`
- `%DisplayName%`
- `%EmailAddress%`
- `%Department%`
- `%Title%`
- `%DistinguishedName%`

## Flujo de Estados de Autologin
1. **Uninitialized**: No hay contraseña maestro guardada en el sistema.
2. **Setup**: Se guarda la contraseña maestro en el primer inicio tras activar AD.
3. **Locked**: La aplicación arranca y espera recuperación de credenciales.
4. **Auto-Unlocked**: Credenciales recuperadas y app desbloqueada sin UI.
5. **Manual-Required**: Fallo en recuperación o cierre de sesión manual; requiere entrada de usuario.
