Cloud Mount - Historias de Usuario

## Visión del Producto
### Propósito
Cloud Mount es una aplicación de escritorio para Windows que permite a los usuarios montar servicios de almacenamiento en la nube como unidades locales del sistema, de forma que puedan acceder a sus archivos remotos directamente desde el Explorador de Windows como si fueran discos locales.

### Problema que resuelve
Configurar y gestionar Rclone mediante línea de comandos requiere conocimientos técnicos y resulta tedioso para usuarios no expertos. Cloud Mount elimina esta barrera ofreciendo una interfaz visual intuitiva que abstrae la complejidad técnica mientras mantiene el acceso a funciones avanzadas para usuarios expertos.

## 1. Instalación y Primer Uso
**HU-1.1 Descarga automática de Rclone**
Al abrir la aplicación, si no encuentra Rclone, que me avise y lo descargue solo mostrando progreso.

**HU-1.2 Configuración obligatoria de seguridad (Actualizada)**
- Si no existe configuración previa o no está encriptada, obligar a establecer una contraseña maestra.
- Requerir confirmación mediante doble entrada de contraseña.
- Validar fortaleza mínima: al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.

**HU-1.3 Recordar mi contraseña de forma segura**
Opción de guardar la contraseña de forma segura (encriptada) para no escribirla en cada inicio.

**HU-1.4 Actualización automática de controladores (Nueva)**
El sistema debe verificar mensualmente si existen actualizaciones del motor de montaje (Drivers Cloud) y aplicarlas automáticamente al inicio.

## 2. Gestión de Servicios de Almacenamiento
**HU-2.1 Ver mis servicios configurados**
Lista visual con tarjetas para cada servicio mostrando nombre, tipo e icono.

**HU-2.2 Iconos reconocibles por servicio**
Backblaze B2, Amazon S3 y Google Cloud Storage con sus logos oficiales.

**HU-2.3 Añadir servicio Backblaze B2 fácilmente**
Formulario nativo con validación de credenciales.

**HU-2.4 Añadir servicio Amazon S3 fácilmente**
Formulario nativo con validación de credenciales.

**HU-2.5 Añadir otros servicios**
Para servicios no soportados, abrir configuración interactiva de Rclone en terminal.

**HU-2.11 Soporte para Azure Blob Storage (Nueva)**
- Formulario nativo para configurar cuentas de Azure Blob Storage usando Account Name y Account Key.
- Encriptación automática de la clave de acceso.

**HU-2.12 Soporte para Protocolos de Archivos (Nueva)**
- Soporte para SFTP (SSH), FTP estándar y FTPS (FTP seguro).
- Parámetros avanzados de compatibilidad para SFTP (shell type, md5/sha1 override).
- Posibilidad de definir una ruta inicial específica para el montaje.

**HU-2.6 Editar un servicio existente**
Botón "Editar" (solo si está desmontado) que abre formulario pre-rellenado con nombre/tipo bloqueados.

**HU-2.7 Eliminar un servicio**
Confirmación antes de borrar y desmontaje automático.

**HU-2.8 Añadir nuevo servicio con selector (Actualizada)**
- Botón redondo (w-14 h-14) con icono "+" centrado.
- Posición flotante abajo a la derecha, por encima de los botones del pie.
- Al pulsar, mostrar un selector con los tipos de servicio disponibles.

**HU-2.9 Importar configuración desde archivo (Actualizada)**
- Posibilidad de añadir servicios mediante la importación de archivos de credenciales (ej. JSON de Google Service Account).
- Las credenciales se integran directamente en la configuración encriptada de la aplicación (sin guardar archivos físicos residuales).
- El sistema muestra un aviso de seguridad instando al usuario a borrar el archivo original tras la importación exitosa.

**HU-2.10 Probar conexión antes de guardar (Nueva)**
- Posibilidad de verificar la validez de las credenciales y el servidor mediante una prueba de conexión real antes de guardar la configuración del servicio.

## 3. Montaje y Desmontaje de Unidades
**HU-3.1 Montar un servicio (Actualizada)**
- Selector de letra de unidad SIN valor preseleccionado.
- Opción de montar en carpeta local (input de texto + botón de diálogo nativo).
- Mutuamente excluyente (Unidad O Carpeta).
- Persistencia de última opción por servicio.

**HU-3.2 Especificar una ruta dentro del servicio**
Campo opcional para especificar ruta remota al montar.

**HU-3.3 Montar el mismo servicio varias veces**
Posibilidad de montar el mismo servicio en varias ubicaciones simultáneamente.

**HU-3.4 Desmontar una unidad**
Botón "Desmontar" que libera los recursos y actualiza la interfaz.

**HU-3.5 Persistencia del estado de montajes (Actualizada)**
Al iniciar la aplicación y tras la autenticación, el sistema debe intentar montar automáticamente todas las unidades que estaban activas en la sesión anterior.

**HU-3.6 Montar servicio en carpeta local (Nueva)**
Alternativa a letra de unidad: montar en `C:\Ruta\Local`.

**HU-3.7 Desmontar todos los servicios (Nueva)**
- Botón "Desmontar todos" (arriba derecha, icono stop-circle) que desmonta todo tras confirmación.

**HU-3.8 Personalización visual en el Explorador (Nueva)**
- Las unidades montadas deben mostrar el icono oficial del servicio (formato .ico) y el nombre personalizado del servicio como etiqueta en el Explorador de Windows.
- La personalización debe limpiarse automáticamente al desmontar la unidad.

## 4. Interfaz Principal
**HU-4.1 Ventana principal clara y sencilla (Actualizada)**
- Cabecera con botón "Desmontar todos".
- Pie con botones redondos: Configuración (rueda) y Acerca de (?).
- Botón flotante "Añadir servicio" (+).

**HU-4.2 Tarjetas de servicio según estado**
Distinción visual clara entre montado y desmontado. Botón Editar solo visible si desmontado.

**HU-4.3 Modal "Acerca de" (Nueva)**
Modal con foto del desarrollador, créditos ("Programado por Daniel Díez Mardomingo") y versión dinámica.

## 5. Bandeja del Sistema (System Tray)
**HU-5.1 Minimizar a la bandeja**
Cerrar ventana minimiza a tray manteniendo montajes activos.

**HU-5.2 Menú rápido desde la bandeja**
Acciones rápidas (Montar/Desmontar todos) desde clic derecho.

**HU-5.3 Cerrar la aplicación sin afectar montajes**
Opción "Cerrar" en tray termina la app pero deja los montajes de Rclone activos.

## 6. Configuración y Exportación
**HU-6.1 Cambiar el tema visual**
Selector Claro/Oscuro/Sistema.

**HU-6.2 Gestionar mi contraseña maestra**
Cambiar o eliminar contraseña guardada.

**HU-6.3 Actualizar Rclone (ELIMINADA)**
Sustituida por actualización automática silenciosa.

**HU-6.4 Exportar configuración (Nueva)**
Exportar servicios seleccionados a un archivo `.conf` encriptado con una contraseña nueva específica.

**HU-6.5 Importar configuración (Nueva)**
Importar archivo `.conf` (detectando si requiere contraseña), gestionando conflictos de nombres.

**HU-6.6 Configuración de arranque automático (Nueva)**
Opción en la configuración para que la aplicación se inicie automáticamente al arrancar Windows e iniciar sesión el usuario.

## 7. Funciones Avanzadas
**HU-7.1 Acceder a la terminal de configuración (ELIMINADA)**
Funcionalidad retirada para simplificar.

**HU-7.2 Acceder a la interfaz web de Rclone**
Botón para abrir la GUI web de Rclone en navegador.

## 8. Notificaciones
**HU-8.1 Notificaciones del sistema**
Avisos nativos de Windows para eventos de montaje/error.

**HU-8.2 Mensajes dentro de la aplicación**
Alertas visuales para validaciones y confirmaciones.

## 13. Splash Screen (Nueva)
**HU-13.1 Pantalla de presentación**
Ventana sin bordes al inicio (mínimo 2s) con Logo, Nombre y Créditos ("Daniel Diez Mardomingo").

## 14. Identidad Visual (Nueva)
**RG-14.1 Paleta de colores corporativa**
Implementar paleta Tailwind: Azul (#5EC2F6), Verde (#6FC30A), Pistacho (#96CE4D) y Fondos (#FDFDFD / #0F172A).