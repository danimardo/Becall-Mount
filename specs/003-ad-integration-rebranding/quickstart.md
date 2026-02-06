# Quickstart: AD Integration & Rebranding

## Setup Development Environment
1. Asegúrate de estar en una máquina unida a un dominio de Active Directory para probar la funcionalidad real.
2. Si no tienes AD, puedes simular la respuesta del comando PowerShell en `src/main/ipc/ad.ts`.

## Implementation Order
1. **Migration Service**: Implementar la lógica de movimiento de carpetas en `src/main/utils/paths.ts` antes de cualquier otra inicialización.
2. **PowerShell Wrapper**: Crear utilidad para ejecutar comandos PS y capturar JSON.
3. **AD Integration Service**: Lógica de consulta a AD mediante .NET (DirectorySearcher).
4. **Conf Processor**: Lógica de sustitución de variables `%Variable%`.
5. **Autologin Security**: Integración con `safeStorage` y Credential Manager.
6. **UI Updates**: Añadir check en Configuración y diálogos de conflicto.

## Verification

### 1. Rebranding Técnico y Visual
- Ejecutar `npm run dev` y verificar que el nombre en el título de la ventana es "Becall-Mount".
- Verificar que el texto de carga en el Splash es "Cargando Becall-Mount...".
- Revisar `package.json` para confirmar `productName: "Becall-Mount"`.

### 2. Escenario de Migración (Manual)
1. Cerrar la aplicación.
2. Crear manualmente la carpeta antigua: `%AppData%\cloud-mount`.
3. Dentro de ella, crear un archivo `rclone.conf` con contenido dummy.
4. Borrar la carpeta nueva si existe: `%AppData%\becall-mount`.
5. Arrancar la aplicación.
6. **Resultado esperado**: La carpeta `%AppData%\becall-mount` debe aparecer con el contenido de `cloud-mount`, y la carpeta `cloud-mount` debe haber desaparecido.

### 3. Integración AD
- Activar integración AD y verificar que `infoDominio` se puebla en el Store.
- Colocar un archivo `.conf` de prueba y verificar importación con variables sustituidas.

### 4. Autologin
- Probar el flujo de autologin cerrando y abriendo la aplicación.
