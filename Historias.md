Cloud Mount - Historias de Usuario
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

HU-2.6 Editar un servicio existente
Como usuario
Quiero poder modificar la configuración de un servicio
Para corregir errores o actualizar credenciales
Lo que espero:

Poder editar nombre y credenciales.
Si el servicio está montado, que no me deje editarlo y me avise de que lo desmonte primero.
Validación de credenciales al guardar.

HU-2.7 Eliminar un servicio
Como usuario
Quiero poder eliminar servicios que ya no uso
Para mantener mi lista ordenada
Lo que espero:

Confirmación antes de borrar.
Si está montado, que lo desmonte automáticamente antes de eliminarlo.


3. Montaje y Desmontaje de Unidades
HU-3.1 Montar un servicio como unidad de Windows
Como usuario
Quiero montar mi servicio de nube como una letra de unidad
Para acceder a mis archivos desde el Explorador de Windows
Lo que espero:

Al pulsar "Montar", poder elegir la letra de unidad.
Solo mostrar letras disponibles (excluyendo siempre C:).
Que recuerde la última letra que usé para ese servicio.
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

HU-4.2 Tarjetas de servicio según estado
Como usuario
Quiero distinguir visualmente el estado de cada servicio
Para saber de un vistazo qué está montado y qué no
Lo que espero:

Desmontado: apariencia atenuada/gris, botones Montar, Editar, Eliminar.
Montado: apariencia destacada con indicador de conexión, muestra letra asignada, botón Desmontar.


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


10. Fuera de Alcance (Por Ahora)
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
