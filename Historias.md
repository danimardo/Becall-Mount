Cloud Mount - Historias de Usuario

Visión del Producto
Propósito
Cloud Mount es una aplicación de escritorio para Windows que permite a los usuarios montar servicios de almacenamiento en la nube como unidades locales del sistema, de forma que puedan acceder a sus archivos remotos directamente desde el Explorador de Windows como si fueran discos locales.

Problema que resuelve
Configurar y gestionar Rclone mediante línea de comandos requiere conocimientos técnicos y resulta tedioso para usuarios no expertos. Cloud Mount elimina esta barrera ofreciendo una interfaz visual intuitiva que abstrae la complejidad técnica mientras mantiene el acceso a funciones avanzadas para usuarios expertos.

Usuarios objetivo

Usuarios generales: Personas que quieren acceder a su almacenamiento en la nube de forma sencilla sin conocimientos técnicos.
Usuarios avanzados: Técnicos que valoran tener acceso directo a las funcionalidades nativas de Rclone cuando lo necesitan.


Contexto y Necesidad
Llevo tiempo usando Rclone para acceder a mis archivos en la nube desde Windows. La herramienta es potente, pero cada vez que necesito montar una unidad o configurar un nuevo servicio tengo que abrir la terminal, recordar los comandos, los parámetros... Es tedioso. Y si quiero que alguien de mi equipo que no es técnico lo use, directamente es imposible.
Lo que necesito es una aplicación de escritorio que haga de intermediaria con Rclone. Una interfaz gráfica sencilla donde pueda ver mis servicios de almacenamiento, montarlos como unidades de Windows con un par de clics, y olvidarme de la línea de comandos para el día a día. Pero sin perder la posibilidad de acceder a las funciones avanzadas de Rclone cuando las necesite.
La aplicación tiene que funcionar en Windows 10 y 11, sin pedir permisos de administrador. Todo en español. Y lo más importante: que sea segura. Mis credenciales de acceso a la nube son sensibles y no quiero que queden expuestas en archivos de texto plano.
A continuación detallo lo que necesito que haga la aplicación.

1. Instalación y Primer Uso
HU-1.1 Descarga automática de Rclone
Como usuario que instala la aplicación por primera vez
Quiero que se descargue automáticamente Rclone si no está presente
Para no tener que buscarlo e instalarlo manualmente
Lo que espero:

Al abrir la aplicación, si no encuentra Rclone, que me avise y lo descargue solo.
Que vea un indicador de progreso mientras descarga.
Que no pueda hacer nada más hasta que termine la descarga.

HU-1.2 Configuración obligatoria de seguridad
Como usuario que inicia la aplicación por primera vez
Quiero que me obligue a establecer una contraseña maestra
Para asegurar que mis credenciales de servicios en la nube estén protegidas desde el principio
Lo que espero:

Si no existe configuración previa, que me pida crear una contraseña antes de continuar.
Si ya existe una configuración de Rclone pero no está encriptada, que me obligue a protegerla.
Que se cree un archivo de configuración vacío pero ya encriptado.

HU-1.3 Recordar mi contraseña de forma segura
Como usuario habitual
Quiero que la aplicación pueda recordar mi contraseña maestra
Para no tener que escribirla cada vez que abro la aplicación
Lo que espero:

Opción de guardar la contraseña de forma segura (encriptada).
Si prefiero no guardarla, que me la pida en cada inicio.
Si la contraseña guardada resulta incorrecta, que la descarte y me la vuelva a pedir.


2. Gestión de Servicios de Almacenamiento
HU-2.1 Ver mis servicios configurados
Como usuario
Quiero ver una lista de todos mis servicios de almacenamiento en la nube
Para saber qué tengo configurado y en qué estado está cada uno
Lo que espero:

Lista visual con tarjetas para cada servicio.
Cada tarjeta muestra: nombre del servicio, tipo (B2, S3, Drive...) e icono identificativo.
Distinguir claramente cuáles están montados y cuáles no.
Los montados deben mostrar la letra de unidad asignada.

HU-2.2 Iconos reconocibles por servicio
Como usuario
Quiero que cada tipo de servicio tenga su propio icono
Para identificarlos visualmente de un vistazo
Lo que espero:

Backblaze B2 con su logo.
Amazon S3 con el logo de AWS.
Google Cloud Storage con su logo.
El resto con un icono genérico de nube.

HU-2.3 Añadir servicio Backblaze B2 fácilmente
Como usuario con cuenta en Backblaze
Quiero un formulario sencillo para configurar mi B2
Para no tener que usar comandos de terminal
Lo que espero:

Formulario con campos claros: nombre para el servicio, Application Key ID y Application Key.
Opción para activar/desactivar el borrado permanente (hard delete).
Que valide mis credenciales antes de guardar.
Si hay error, que me lo diga y me deje corregir sin perder lo que escribí.

HU-2.4 Añadir servicio Amazon S3 fácilmente
Como usuario con cuenta en AWS
Quiero un formulario sencillo para configurar mi S3
Para no tener que usar comandos de terminal
Lo que espero:

Formulario con: nombre, proveedor, Access Key ID, Secret Access Key, región y endpoint.
Validación de credenciales antes de guardar.
Manejo de errores igual que con B2.

HU-2.5 Añadir otros servicios
Como usuario con servicios no soportados por formulario
Quiero poder configurarlos igualmente
Para no estar limitado a B2 y S3
Lo que espero:

Para servicios como Google Drive, Dropbox, etc., que me abra la configuración interactiva de Rclone en terminal.
Al cerrar la terminal, que la lista de servicios se actualice.

HU-2.6 Editar un servicio existente (Implementado)
Como usuario
Quiero poder modificar la configuración de un servicio
Para corregir errores o actualizar credenciales
Lo que espero:

Botón "Editar" visible en la tarjeta del servicio (solo cuando está desmontado).
Formulario pre-rellenado con los valores actuales del servicio.
Nombre y Tipo bloqueados (solo lectura) para evitar inconsistencias en Rclone.
Poder actualizar cualquier otro parámetro (claves, buckets, regiones, etc.).
Validación de campos obligatorios al guardar cambios.
Si el servicio está montado, el botón de edición está oculto o deshabilitado para evitar conflictos.
Al guardar, los cambios se aplican inmediatamente en el archivo de configuración.

HU-2.7 Eliminar un servicio
Como usuario
Quiero poder eliminar servicios que ya no uso
Para mantener mi lista ordenada
Lo que espero:

Confirmación antes de borrar.
Si está montado, que lo desmonte automáticamente antes de eliminarlo.

HU-2.8 Añadir nuevo servicio con selector
Como usuario
Quiero un botón claro para añadir nuevos servicios
Para iniciar el proceso de configuración de forma intuitiva
Lo que espero:

Botón visible y accesible para añadir servicio.
Al pulsarlo, mostrar un selector con los tipos de servicio disponibles.
Si selecciono un servicio con formulario nativo (B2, S3), mostrar el formulario correspondiente.
Si selecciono un servicio sin formulario nativo, abrir la configuración interactiva de Rclone en terminal.

Arquitectura de Configuración Dinámica (Implementado)
Nota técnica: La aplicación implementa una arquitectura de configuración dinámica basada en JSON para máxima flexibilidad y mantenibilidad.

Esquema de Configuración:
- Archivo: `src/renderer/src/config/remotes-schema.json`
- Define estructura de campos para cada tipo de servicio
- Soporta campos ocultos (ej: `type`, `provider`) que se envían pero no se muestran
- Configuración de labels, placeholders, tipos y valores por defecto
- Empaquetado con la aplicación, no editable por el usuario

Componentes de Implementación:
1. **remotes-schema.json**: Define campos para Amazon S3 y Backblaze B2
2. **remote-schema-loader.ts**: Utilidades para cargar y procesar el esquema
   - `getAvailableRemoteTypes()`: Obtiene tipos disponibles
   - `getVisibleFields()`: Filtra campos visibles (excluye hidden)
   - `buildConfigWithDefaults()`: Construye config con valores por defecto
3. **AddServiceForm.svelte**: Componente refactorizado para generar campos dinámicamente
4. **types.ts**: Tipos TypeScript para esquema (RemoteFieldConfig, RemoteSchema, RemotesSchema)

Ventajas:
- Fácil añadir nuevos servicios sin modificar código
- Tipado fuerte con TypeScript
- Valores por defecto configurables
- Soporte para campos tipo string, boolean, number
- Extensible para futuros servicios (Dropbox, Google Drive, etc.)

Ejemplo de Añadir Nuevo Servicio:
Para añadir soporte para un nuevo servicio, simplemente se añade una entrada en `remotes-schema.json` sin necesidad de modificar el código de la aplicación.

Mejoras de Configuración y Validación (Implementado)
Campos de Bucket y Ruta:
- **Bucket**: Campo para especificar un bucket concreto en la configuración del servicio
  - Para Amazon S3: campo **obligatorio**
  - Para Backblaze B2: campo **opcional**
  - Permite montar directamente un bucket específico sin navegar desde la raíz
- **Ruta (Path)**: Campo opcional para especificar una ruta dentro del bucket
  - Aplica tanto para S3 como para B2
  - Permite montar directamente una subcarpeta específica

Iconos Personalizados por Servicio:
- **Campo `icon`** en el esquema JSON
- Permite especificar una URL para el logo/icono de cada servicio
- Si no se especifica, se usa un icono genérico de nube
- Mejora la identificación visual en la interfaz principal
- Ejemplos implementados:
  - Amazon S3: Logo oficial de AWS
  - Backblaze B2: Logo oficial de Backblaze

Validación de Campos Obligatorios:
- **Marcado visual**: Campos obligatorios mostrados con asterisco rojo (*)
- **Validación al enviar**: La aplicación valida que todos los campos requeridos estén completos
- **Mensajes de error**: Alertas claras indicando qué campos faltan
- **Limpieza automática**: Los errores se eliminan cuando el usuario corrige los campos
- Comportamiento:
  - Solo valida al pulsar el botón "Crear" (no en tiempo real)
  - Muestra múltiples errores a la vez
  - Usa el sistema de alertas de DaisyUI

Actualización de Campos Existentes:
- **Endpoint para S3**: Ahora es **obligatorio** (antes era opcional)
- **Bucket para S3**: Ahora es **obligatorio**
- **Bucket para B2**: **Opcional** (permite acceder a todos los buckets si no se especifica)
- **Path**: **Opcional** para ambos servicios

Documentación del Formato:
- **Archivo `SCHEMA_FORMAT.md`**: Documentación completa del formato JSON
  - Descripción detallada de cada campo del esquema
  - Ejemplos de configuración para S3 y B2
  - Instrucciones para añadir nuevos servicios
  - Consideraciones de seguridad
  - Integración con el código TypeScript

Implementación Técnica:
- **Validación**: Función `validateRequiredFields()` en AddServiceForm.svelte
- **Estado de errores**: Array `validationErrors` para mantener múltiples errores
- **Marcado visual**: `{#if fieldConfig.required}` con `<span class="text-error">*</span>`
- **Alertas**: Componente `alert alert-error` de DaisyUI
- **Tipos actualizados**: Campo `icon?: string` añadido a `RemoteSchema` en types.ts


3. Montaje y Desmontaje de Unidades
HU-3.1 Montar un servicio como unidad de Windows (Implementado)
Como usuario
Quiero montar mi servicio de nube como una letra de unidad
Para acceder a mis archivos desde el Explorador de Windows
Lo que espero:

Al pulsar "Montar", ver un selector con las letras de unidad.
El selector solo muestra letras que están realmente LIBRES en el sistema.
Se excluye automáticamente la unidad C: y cualquier unidad ya ocupada (USB, red, otros montajes).
La aplicación comprueba la disponibilidad en tiempo real al abrir el modal.
Si no hay letras libres, se muestra un aviso claro.
Ver un estado de "Conectando..." mientras trabaja.
Notificación cuando el montaje se complete o si falla.

HU-3.2 Especificar una ruta dentro del servicio
Como usuario
Quiero poder montar solo una carpeta o bucket específico
Para no tener que navegar desde la raíz cada vez
Lo que espero:

Campo opcional para especificar ruta al montar.
Por defecto vacío (monta todo el servicio).
Que recuerde la ruta para futuros montajes.

HU-3.3 Montar el mismo servicio varias veces
Como usuario avanzado
Quiero poder montar un mismo servicio en varias letras
Para tener acceso simultáneo a diferentes carpetas o buckets
Lo que espero:

Poder montar el mismo servicio en Z: con una ruta y en Y: con otra.
Que cada montaje sea independiente.

HU-3.4 Desmontar una unidad
Como usuario
Quiero desmontar un servicio cuando ya no lo necesite
Para liberar la letra de unidad y los recursos
Lo que espero:

Botón "Desmontar" en los servicios montados.
Que el proceso se cierre correctamente.
Que la interfaz refleje el cambio inmediatamente.

HU-3.5 Persistencia del estado de montajes
Como usuario
Quiero que la aplicación recuerde qué estaba montado
Para no perderme si cierro y abro la aplicación
Lo que espero:

Al reiniciar la app, que detecte si los montajes que tenía siguen activos.
Si un montaje se cerró externamente, que actualice el estado a desmontado.


4. Interfaz Principal
HU-4.1 Ventana principal clara y sencilla
Como usuario
Quiero una interfaz limpia y fácil de entender
Para realizar las operaciones habituales sin confusión
Lo que espero:

Cabecera con el nombre e icono de la aplicación.
Área central con las tarjetas de servicios.
Pie con botones para: interfaz web de Rclone, ayuda y configuración.

HU-4.2 Tarjetas de servicio según estado (Implementado)
Como usuario
Quiero distinguir visualmente el estado de cada servicio
Para saber de un vistazo qué está montado y qué no
Lo que espero:

Desmontado: botones Montar, Editar, Eliminar.
Montado: apariencia destacada, muestra letra asignada, botón Desmontar.
El botón Editar solo está disponible si el servicio está desmontado.


5. Bandeja del Sistema (System Tray)
HU-5.1 Minimizar a la bandeja
Como usuario
Quiero que al cerrar la ventana la aplicación se quede en la bandeja
Para que los montajes sigan funcionando sin ocupar espacio en la barra de tareas
Lo que espero:

Al pulsar X, que se minimice a la bandeja, no que se cierre.
Los montajes siguen activos.
Clic en el icono de la bandeja restaura la ventana.

HU-5.2 Menú rápido desde la bandeja
Como usuario
Quiero acceder a acciones básicas desde el icono de la bandeja
Para montar o desmontar sin abrir la ventana completa
Lo que espero menú de clic derecho con:

"Abrir Cloud Mount"
"Montar todos"
"Desmontar todos"
Separador
Lista de servicios con su estado
Separador
"Cerrar"

HU-5.3 Cerrar la aplicación sin afectar montajes
Como usuario
Quiero poder cerrar completamente la aplicación
Para liberar recursos del sistema cuando no la necesite
Lo que espero:

Al seleccionar "Cerrar" del menú de bandeja, la aplicación se cierra.
Los montajes activos siguen funcionando (los procesos de Rclone no se cierran).


6. Configuración
HU-6.1 Cambiar el tema visual
Como usuario
Quiero elegir entre tema claro, oscuro o automático
Para adaptar la aplicación a mis preferencias
Lo que espero:

Opciones: Claro, Oscuro, Seguir sistema.
Cambio inmediato al seleccionar.

HU-6.2 Gestionar mi contraseña maestra
Como usuario
Quiero poder cambiar o eliminar mi contraseña guardada
Para mantener el control sobre la seguridad
Lo que espero:

Cambiar contraseña (pidiendo la actual primero).
Eliminar contraseña almacenada (me la pedirá en cada inicio).

HU-6.3 Actualizar Rclone
Como usuario
Quiero poder actualizar Rclone desde la aplicación
Para tener las últimas mejoras sin procesos manuales
Lo que espero:

Ver la versión actual instalada.
Botón para buscar actualizaciones.
Si hay montajes activos, que me avise de que debo desmontar antes.


7. Funciones Avanzadas
HU-7.1 Acceder a la terminal de configuración de Rclone
Como usuario avanzado
Quiero poder usar el configurador interactivo de Rclone
Para realizar configuraciones que la interfaz gráfica no soporta
Lo que espero:

Botón que abra una terminal con rclone config.
Al cerrar la terminal, que la lista de servicios se recargue.

HU-7.2 Acceder a la interfaz web de Rclone
Como usuario avanzado
Quiero poder lanzar la interfaz web oficial de Rclone
Para gestiones complejas vía navegador
Lo que espero:

Botón dedicado (icono de mapamundi en el pie).
Que se abra en mi navegador predeterminado.
Que no bloquee la aplicación principal.


8. Notificaciones
HU-8.1 Notificaciones del sistema
Como usuario
Quiero recibir notificaciones de Windows para eventos importantes
Para estar informado sin tener la ventana abierta
Eventos que quiero que me notifique:

Montaje completado correctamente.
Error al montar (con descripción útil).
Error de conexión o pérdida de montaje.
Contraseña incorrecta.
Actualización de Rclone disponible o completada.

HU-8.2 Mensajes dentro de la aplicación
Como usuario
Quiero ver mensajes claros cuando algo sucede
Para entender qué está pasando
Lo que espero:

Errores de validación en formularios.
Confirmaciones de acciones (eliminado, guardado...).
Avisos informativos (desmontar antes de editar, etc.).


9. Requisitos Generales
RG-9.1 Plataforma y permisos

Debe funcionar en Windows 10 y Windows 11.
No debe requerir permisos de administrador.

RG-9.2 Idioma

Toda la interfaz en español.
Todos los mensajes de error en español.

RG-9.3 Rendimiento

La aplicación debe arrancar en menos de 5 segundos (sin contar descarga inicial).
Las acciones de montar/desmontar deben dar feedback inmediato.

RG-9.4 Seguridad

Nunca mostrar credenciales en logs.
Contraseña maestra siempre encriptada.
Archivo de configuración de Rclone siempre encriptado.

RG-9.5 Almacenamiento

Todo se guarda en %APPDATA%, nada en carpetas del sistema.

RG-9.6 Usabilidad

Montar/desmontar en máximo 2 clics.
Estados visuales claros.
Mensajes de error comprensibles para no técnicos.

RG-9.7 Fiabilidad

Detectar y manejar estados inconsistentes (procesos huérfanos, etc.).
Que un error en un servicio no afecte a los demás.


10. Casos de Uso Principales
CU-01: Primer inicio de la aplicación
Actor: Usuario nuevo
Flujo principal:

Usuario abre la aplicación por primera vez.
La aplicación detecta que no existe Rclone instalado.
Muestra mensaje de descarga y comienza descarga automática.
Al completar, solicita establecer contraseña maestra.
Usuario ingresa y confirma contraseña.
Se crea configuración encriptada vacía.
Se muestra pantalla principal con lista de servicios vacía.

CU-02: Añadir servicio Backblaze B2
Actor: Usuario
Precondición: Aplicación configurada, usuario tiene credenciales de B2
Flujo principal:

Usuario pulsa "Añadir servicio".
Selecciona "Backblaze B2".
Completa formulario con nombre y credenciales.
Pulsa "Guardar".
Aplicación valida credenciales contra el servicio.
Si son válidas, guarda el servicio y lo muestra en la lista.
Flujo alternativo (credenciales inválidas):
5a. Aplicación muestra error de validación.
5b. Usuario corrige datos y reintenta.

CU-03: Montar servicio
Actor: Usuario
Precondición: Existe al menos un servicio configurado
Flujo principal:

Usuario localiza servicio desmontado en la lista.
Pulsa "Montar".
Selecciona letra de unidad de las disponibles.
Opcionalmente especifica ruta remota.
Pulsa "Conectar".
Aplicación muestra estado "Conectando...".
Montaje se completa, tarjeta cambia a estado montado.
Notificación confirma montaje exitoso.

CU-04: Desmontar servicio
Actor: Usuario
Precondición: Servicio montado
Flujo principal:

Usuario localiza servicio montado.
Pulsa "Desmontar".
Aplicación termina el proceso de montaje.
Tarjeta cambia a estado desmontado.

CU-05: Montar/desmontar desde bandeja del sistema
Actor: Usuario
Precondición: Aplicación minimizada en bandeja
Flujo principal:

Usuario hace clic derecho en icono de bandeja.
Selecciona "Montar todos" o "Desmontar todos".
Aplicación ejecuta la acción sobre todos los servicios aplicables.
Notificación confirma resultado.

CU-06: Cerrar aplicación manteniendo montajes
Actor: Usuario
Precondición: Servicios montados
Flujo principal:

Usuario cierra ventana principal (X).
Aplicación se minimiza a bandeja, montajes permanecen.
Usuario hace clic derecho en icono de bandeja.
Selecciona "Cerrar".
Aplicación se cierra, montajes siguen funcionando.

CU-07: Editar servicio existente
Actor: Usuario
Precondición: Servicio existente desmontado
Flujo principal:

Usuario pulsa "Editar" en un servicio.
Se muestra formulario con datos actuales.
Usuario modifica campos deseados.
Pulsa "Guardar".
Aplicación valida y guarda cambios.
Flujo alternativo (servicio montado):
1a. Usuario intenta editar servicio montado.
1b. Aplicación muestra mensaje: "Desmonta el servicio antes de editar".


11. Criterios de Éxito
Facilidad de primer uso
El usuario puede montar su primer servicio en menos de 5 minutos desde que abre la aplicación por primera vez.

Fiabilidad de montajes
Los montajes permanecen estables durante sesiones de trabajo prolongadas sin desconexiones inesperadas.

Recuperación de estado
Al reiniciar la aplicación, refleja correctamente qué montajes siguen activos y cuáles se cerraron externamente.

Accesibilidad de acciones
Montar o desmontar un servicio requiere máximo 2 clics desde cualquier estado de la aplicación.

Claridad de errores
El usuario comprende qué salió mal y cómo solucionarlo a partir de los mensajes de error mostrados.


12. Fuera de Alcance (Por Ahora)
Estas funcionalidades no son necesarias en la primera versión:

Inicio automático con Windows.
Montaje automático de servicios al abrir la aplicación.
Monitoreo de salud de conexiones.
Soporte multi-idioma.
Atajos de teclado.
Configuración avanzada de caché por servicio.
Límites de ancho de banda.
Sincronización bidireccional.


11. Gestión del Proyecto y Control de Versiones
HU-11.1 Repositorio Git y proyecto en GitHub
Como desarrollador del proyecto
Quiero que el código esté versionado con Git y subido a GitHub
Para tener control de versiones, colaboración y backup del código
Lo que espero:

Inicialización de repositorio Git en el proyecto.
Creación de un nuevo repositorio en GitHub bajo el usuario danimardo.
Configuración correcta del remote origin para apuntar al repositorio de GitHub.
Subida inicial del código con un commit descriptivo.
README.md con la descripción del proyecto, instrucciones de instalación y uso.
.gitignore configurado para ignorar archivos sensibles (credenciales, binarios, dependencias) y archivos específicos de Windows/Node.js.

12. Stack Tecnológico Preferente
RG-12.1 Tecnologías de Interfaz y Construcción
Como desarrollador
Quiero utilizar tecnologías específicas para la implementación
Para alinearme con mis preferencias y necesidades técnicas
Lo que espero:

Uso de Electron Forge para el empaquetado y distribución.
Uso de Svelte como framework de frontend.
Uso de DaisyUI para los componentes de interfaz y estilos.
Uso de TypeScript para el tipado estático.
