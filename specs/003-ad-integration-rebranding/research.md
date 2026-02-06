# Research: AD Integration & Rebranding (Becall-Mount)

## decision-001: PowerShell Integration for AD Info
**Decision**: Usar `node-powershell` o `child_process.spawn` con el flag `-OutputFormat Text` y convertir a JSON mediante `ConvertTo-Json`.
**Rationale**: Permite una integración directa con los cmdlets de Windows sin dependencias nativas pesadas de Node.js que puedan fallar en diferentes versiones de Windows.
**Alternatives considered**: Librerías LDAP nativas (complejas de configurar con Kerberos/SSPI en Windows), ejecutar scripts `.ps1` externos (más difícil de gestionar permisos y rutas).

## decision-002: RSAT Installation
**Decision**: Usar `Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS.Tools~~~~0.0.1.0"`.
**Rationale**: Es el método oficial y moderno para Windows 10 (version 1809+) y Windows 11 para instalar las herramientas de administración de AD. Requiere elevación.
**Alternatives considered**: Descargar instaladores `.msu` (obsoleto y dependiente de la versión exacta de Windows).

## decision-003: Secure Storage for Autologin
**Decision**: Usar `safeStorage` de Electron para cifrar la contraseña maestro y `node-keytar` o una implementación directa de `Windows Credential Manager` para persistencia persistente vinculada al usuario.
**Rationale**: `safeStorage` utiliza la API de protección de datos de Windows (DPAPI), que está vinculada intrínsecamente al usuario de Windows actual.
**Alternatives considered**: Guardar en texto plano (Inseguro), usar solo `electron-store` (Inseguro para contraseñas).

## decision-004: Rebranding Strategy
**Decision**: Actualizar `package.json` (`name`, `productName`), `forge.config.ts` y las rutas en `src/main/utils/paths.ts`. Implementar un "Migration Service" que se ejecute antes de inicializar el Store principal.
**Rationale**: Cambiar el `appId` en Electron causa que la ruta por defecto de `app.getPath('userData')` cambie. Es necesario mover los archivos manualmente antes de que la aplicación intente cargarlos de la nueva ruta.
**Alternatives considered**: Mantener el nombre de carpeta antiguo (Confuso para el rebranding), usar symlinks (Poco fiable en Windows).

## decision-005: Variable Substitution in .conf
**Decision**: Implementar un motor de plantillas simple basado en expresiones regulares para buscar `%Campo%` y reemplazarlo por `infoDominio[Campo]`.
**Rationale**: Evita la complejidad de motores como Handlebars para una tarea de sustitución estática simple.
**Alternatives considered**: `envsubst` (No disponible por defecto en Windows), `replace-in-file` (Dependencia extra innecesaria).
