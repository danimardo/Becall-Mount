# Feature Specification: Integración con Active Directory y Rebranding (Becall-Mount)

**Feature Branch**: `003-ad-integration-rebranding`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "Integración con Active Directory para automatización de configuraciones, autologin seguro y rebranding completo a Becall-Mount."

## Clarifications

### Session 2026-02-05
- Q: ¿Cómo debe actuar el sistema si encuentra un conflicto de nombres entre un remoto local y uno importado de AD? → A: Mostrar un aviso y pedir confirmación para sobrescribir el remoto existente.
- Q: Si una variable no existe o está vacía en AD, ¿cómo debe proceder el sistema en el archivo de configuración final? → A: Sustituir por una cadena vacía ("").
- Q: Si el usuario cierra sesión manualmente, ¿debe el sistema permitir volver a entrar automáticamente usando AD? → A: Forzar la introducción manual de la contraseña maestro para volver a entrar.
- Q: ¿Debe el sistema escanear solo una carpeta predefinida interna o permitir una ruta externa para los archivos .conf? → A: Usar carpeta interna por defecto y añadir una opción para elegir una ruta externa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatización de Configuración con AD (Priority: P1)

Como usuario de Becall, quiero que mi aplicación se configure automáticamente con mis credenciales de red para no tener que introducir manualmente los datos de mis unidades de red.

**Why this priority**: Es la funcionalidad principal que justifica la integración con AD y reduce drásticamente el tiempo de configuración inicial para los empleados.

**Independent Test**: Se puede probar activando el check de AD en una máquina unida a dominio; la aplicación debe obtener `infoDominio` e informar conflictos si existen; debe importar remotos desde archivos `.conf` sustituyendo variables como `%SamAccountName%`.

**Acceptance Scenarios**:

1. **Given** la aplicación abierta en la sección de Configuración, **When** el usuario activa "Integrar con Active Directory", **Then** se obtiene la información del usuario del dominio y se importan los archivos de configuración procesados.
2. **Given** un remoto manual llamado "Trabajo" y un `.conf` que también define "Trabajo", **When** se activa la integración AD, **Then** el sistema muestra un diálogo de confirmación antes de sobrescribir.
3. **Given** un archivo `.conf` con la variable `%Inexistente%`, **When** se importa con AD activo, **Then** la variable se sustituye por "" en la configuración resultante.
4. **Given** una ruta externa configurada con archivos `.conf`, **When** se activa la integración AD, **Then** el sistema importa los remotos de esa carpeta además de los internos.

---

### User Story 2 - Autologin Seguro (Priority: P2)

Como usuario, quiero que la aplicación se desbloquee automáticamente al iniciar mi sesión de Windows para no tener que escribir mi contraseña maestro cada vez que arranco el ordenador.

**Why this priority**: Mejora significativamente la experiencia de usuario (UX) diaria al eliminar fricción en el arranque.

**Independent Test**: Tras configurar la contraseña maestro y activar AD, reiniciar la aplicación debe llevar directamente a la gestión de servicios sin pedir contraseña.

**Acceptance Scenarios**:

1. **Given** la integración AD activa y una contraseña maestro establecida, **When** se reinicia la aplicación, **Then** se recupera la clave de forma segura del sistema y la aplicación se desbloquea automáticamente.
2. **Given** la sesión desbloqueada mediante autologin, **When** el usuario selecciona "Cerrar sesión" manualmente, **Then** el sistema bloquea el acceso y requiere la contraseña maestro para volver a entrar (el autologin se suspende hasta el próximo arranque).

---

### User Story 3 - Rebranding y Migración Transparente (Priority: P3)

Como usuario existente de la versión anterior, quiero actualizar la aplicación y que todos mis datos sigan allí, bajo el nuevo nombre de "Becall-Mount".

**Why this priority**: Esencial para la consistencia de marca y para asegurar que los usuarios actuales no pierdan su configuración tras el cambio de identidad.

**Independent Test**: Instalar la nueva versión sobre una instalación antigua; verificar que la carpeta de datos se mueve a `becall-mount` y que el nombre en la interfaz es el correcto.

**Acceptance Scenarios**:

1. **Given** una instalación antigua con datos en `%AppData%\antigua-carpeta`, **When** se arranca Becall-Mount por primera vez, **Then** los datos (incluyendo rclone.conf) se mueven a `%AppData%\becall-mount` y la carpeta antigua se elimina.

## Edge Cases

- **Sin conexión al controlador de dominio**: Si el equipo no tiene línea de vista con el dominio al activar el check, se debe mostrar un error amigable indicando la imposibilidad de contactar con el servidor.
- **Fallo en sustitución de variables**: Si un archivo `.conf` requiere una variable que no existe en el perfil del usuario de AD, el sistema sustituirá la variable por una cadena vacía ("").
- **Error de espacio en disco durante migración**: Si no hay espacio para copiar los datos a la nueva ruta de rebranding, la aplicación debe detener el proceso y no borrar la carpeta antigua.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE proporcionar una opción "Integrar con Active Directory" en la configuración del usuario. Esta opción SOLO estará habilitada si el sistema detecta que el equipo está unido a un dominio.
- **FR-002**: El sistema DEBE utilizar `DirectoryServices.DirectorySearcher` para obtener los campos `SamAccountName`, `DisplayName`, `EmailAddress`, `DistinguishedName`, `Department`, `Title` y `MemberOf`.
- **FR-004**: El sistema DEBE persistir la información del dominio en la estructura `infoDominio` dentro del Store local.
- **FR-005**: El sistema DEBE escanear e importar automáticamente archivos `.conf` desde la carpeta interna de recursos y opcionalmente desde una carpeta externa configurable.
- **FR-006**: El sistema DEBE sustituir variables con formato `%Variable%` en los archivos `.conf` utilizando los valores de `infoDominio`. Si la variable no existe, se usará una cadena vacía.
- **FR-007**: El sistema DEBE gestionar conflictos de nombres durante la importación automática solicitando confirmación al usuario para sobrescribir.
- **FR-008**: El sistema DEBE activar automáticamente el autologin seguro al habilitar la integración con AD, solicitando la contraseña maestro una única vez para su almacenamiento cifrado.
- **FR-009**: El sistema DEBE ocultar las opciones de configuración de AD si no se detecta conectividad con un dominio.
- **FR-010**: El sistema DEBE renombrar todos los elementos visuales y técnicos (Product Name, App ID, Rutas) a "Becall-Mount".
- **FR-011**: El sistema DEBE realizar una migración automática de la carpeta de configuración antigua y del archivo `rclone.conf` a la nueva ruta en el primer arranque.

### Key Entities *(include if feature involves data)*

- **infoDominio**: Estructura de datos que almacena la información recuperada de Active Directory. Atributos: `SamAccountName`, `DisplayName`, `Email`, etc.
- **Fichero .conf**: Archivo de plantilla para configuración de rclone que contiene variables dinámicas para personalización por usuario.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden completar la integración con AD en menos de 1 minuto.
- **SC-002**: El 100% de las variables `%Variable%` coincidentes con campos de AD son sustituidas correctamente durante la importación.
- **SC-003**: El tiempo de acceso a la funcionalidad principal desde el arranque se reduce en al menos 10 segundos al evitar la entrada manual de contraseña (autologin).
- **SC-004**: La migración de datos de versiones anteriores se completa con un 0% de pérdida de configuración de remotos existentes.