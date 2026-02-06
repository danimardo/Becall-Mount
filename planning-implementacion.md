# Planning de Implementación - Becall-Mount

## Visión General

Este documento detalla el planning de implementación de las funcionalidades especificadas en el documento de Historias de Usuario, organizado por fases y dependencias técnicas.

---

## Fase 1: Fundamentos Técnicos e Infraestructura

### Objetivo
Establecer la base técnica del proyecto incluyendo configuración de herramientas, estructura de proyecto y sistemas básicos.

### Tareas

#### 1.1 Configuración Inicial del Proyecto
- [ ] Inicializar proyecto Electron con Electron Forge
- [ ] Configurar TypeScript
- [ ] Configurar Svelte como framework de frontend
- [ ] Configurar DaisyUI y Tailwind CSS
- [ ] Establecer estructura de carpetas del proyecto
- [ ] Configurar ESLint y Prettier
- [ ] Crear .gitignore completo (Node, Windows, builds, credenciales)

**Tiempo estimado**: 2-3 días

#### 1.2 Sistema de Configuración y Almacenamiento
- [ ] Implementar sistema de almacenamiento en %APPDATA%
- [ ] Crear sistema de gestión de configuración
- [ ] Implementar encriptación de archivos (para contraseña y config de Rclone)
- [ ] Crear módulo de gestión de credenciales en registro de Windows
- [ ] Implementar sistema de logs seguro (sin credenciales)

**Tiempo estimado**: 3-4 días

#### 1.3 Integración con Rclone
- [ ] Crear módulo de ejecución de comandos Rclone
- [ ] Implementar verificación de existencia de Rclone
- [ ] Crear sistema de descarga automática de Rclone
- [ ] Implementar detector de versión de Rclone
- [ ] Crear sistema de actualización de Rclone
- [ ] Implementar gestión de procesos (spawn, kill, check if alive)

**Tiempo estimado**: 4-5 días

**Hitos de Fase 1**:
- ✅ Proyecto ejecutable
- ✅ Rclone se descarga automáticamente
- ✅ Sistema de almacenamiento y encriptación funcional

---

## Fase 2: Seguridad y Configuración Inicial

### Objetivo
Implementar el sistema de seguridad y flujo de primer inicio.

### Tareas

#### 2.1 Sistema de Contraseña Maestra
- [ ] Crear UI de establecimiento de contraseña (primer inicio)
- [ ] Implementar validación de contraseña (fortaleza mínima)
- [ ] Crear UI de solicitud de contraseña (inicios posteriores)
- [ ] Implementar sistema de remember password (encriptado en registro)
- [ ] Crear UI de cambio de contraseña
- [ ] Implementar eliminación de contraseña guardada

**Tiempo estimado**: 3-4 días

#### 2.2 Gestión de Configuración de Rclone
- [ ] Implementar encriptación/desencriptación de config de Rclone
- [ ] Crear sistema para detectar config existente no encriptada
- [ ] Implementar flujo de migración de config no encriptada a encriptada
- [ ] Integrar con Rclone config (terminal interactiva)
- [ ] Recargar lista de servicios tras cierre de terminal

**Tiempo estimado**: 2-3 días

#### 2.3 Flujo de Primer Inicio (CU-01)
- [ ] Implementar detección de primer inicio
- [ ] Crear wizard de primer inicio:
  - [ ] Paso 1: Descarga de Rclone (con progreso)
  - [ ] Paso 2: Establecer contraseña maestra
  - [ ] Paso 3: Bienvenida y explicación básica
- [ ] Persistir estado de "configuración completada"

**Tiempo estimado**: 2-3 días

**Hitos de Fase 2**:
- ✅ Sistema de seguridad funcional
- ✅ Flujo de primer inicio completo
- ✅ Configuración de Rclone encriptada

---

## Fase 3: Interfaz Principal y Gestión de Servicios

### Objetivo
Construir la UI principal y sistema de gestión de servicios.

### Tareas

#### 3.1 Interfaz Principal (HU-4.1, HU-4.2)
- [ ] Crear estructura de ventana principal (header, main, footer)
- [ ] Implementar sistema de temas (claro/oscuro/auto)
- [ ] Crear componente de tarjeta de servicio
  - [ ] Estado desmontado (apariencia atenuada)
  - [ ] Estado montado (apariencia destacada)
  - [ ] Iconos por tipo de servicio (B2, S3, GCS, genérico)
- [ ] Implementar botones de acción por estado
- [ ] Crear indicadores visuales de estado

**Tiempo estimado**: 4-5 días

#### 3.2 Listado de Servicios (HU-2.1)
- [ ] Implementar parser de configuración de Rclone
- [ ] Extraer servicios configurados
- [ ] Detectar tipo de cada servicio
- [ ] Crear sistema de detección de montajes activos
- [ ] Implementar refresh de lista de servicios

**Tiempo estimado**: 3-4 días

#### 3.3 Añadir Servicios - B2 y S3 (HU-2.3, HU-2.4, HU-2.8)
- [ ] Crear modal de selector de tipo de servicio
- [ ] Implementar formulario para Backblaze B2:
  - [ ] Campos: nombre, key ID, key
  - [ ] Checkbox: hard delete
  - [ ] Validación de credenciales
- [ ] Implementar formulario para Amazon S3:
  - [ ] Campos: nombre, proveedor, access key, secret key, región, endpoint
  - [ ] Validación de credenciales
- [ ] Crear sistema de guardado en config de Rclone
- [ ] Implementar manejo de errores con recuperación de datos

**Tiempo estimado**: 5-6 días

#### 3.4 Añadir Otros Servicios (HU-2.5)
- [ ] Crear launcher de terminal con `rclone config`
- [ ] Implementar detección de cierre de terminal
- [ ] Refrescar lista de servicios automáticamente

**Tiempo estimado**: 2 días

#### 3.5 Editar y Eliminar Servicios (HU-2.6, HU-2.7)
- [ ] Crear UI de edición de servicio
- [ ] Implementar bloqueo de edición si está montado
- [ ] Implementar validación de credenciales al editar
- [ ] Crear flujo de eliminación con confirmación
- [ ] Implementar desmontaje automático antes de eliminar

**Tiempo estimado**: 3 días

**Hitos de Fase 3**:
- ✅ Interfaz principal funcional
- ✅ Gestión completa de servicios (CRUD)
- ✅ Formularios para B2 y S3

---

## Fase 4: Sistema de Montaje y Desmontaje

### Objetivo
Implementar el core de la aplicación: montaje de servicios como unidades.

### Tareas

#### 4.1 Sistema de Montaje (HU-3.1, CU-03)
- [ ] Crear detector de letras de unidad disponibles
- [ ] Implementar selector de letra (excluyendo siempre C:)
- [ ] Crear sistema de recordatorio de última letra usada
- [ ] Implementar comando de montaje de Rclone
- [ ] Crear sistema de registro de montajes activos (servicio, letra, PID)
- [ ] Implementar verificación de éxito de montaje
- [ ] Crear estados de "Conectando..." y montado

**Tiempo estimado**: 5-6 días

#### 4.2 Ruta Remota Opcional (HU-3.2)
- [ ] Añadir campo de ruta remota en UI de montaje
- [ ] Implementar validación de ruta
- [ ] Crear sistema de recordatorio de ruta por servicio
- [ ] Integrar ruta en comando de montaje

**Tiempo estimado**: 2 días

#### 4.3 Montajes Múltiples (HU-3.3)
- [ ] Implementar soporte para múltiples montajes del mismo servicio
- [ ] Crear sistema de tracking de montajes independientes
- [ ] Permitir diferentes rutas por montaje

**Tiempo estimado**: 3 días

#### 4.4 Desmontaje (HU-3.4, CU-04)
- [ ] Implementar comando de desmontaje
- [ ] Crear sistema de terminación limpia de proceso
- [ ] Actualizar interfaz tras desmontaje
- [ ] Eliminar registro de montaje activo

**Tiempo estimado**: 2 días

#### 4.5 Persistencia de Montajes (HU-3.5)
- [ ] Crear sistema de guardado de estado de montajes
- [ ] Implementar verificación de procesos al inicio
- [ ] Detectar procesos cerrados externamente
- [ ] Actualizar estado de montajes inconsistentes

**Tiempo estimado**: 3 días

**Hitos de Fase 4**:
- ✅ Sistema de montaje completo
- ✅ Montajes múltiples funcionales
- ✅ Persistencia de estado operativa

---

## Fase 5: Bandeja del Sistema

### Objetivo
Implementar integración con system tray para ejecución en segundo plano.

### Tareas

#### 5.1 Icono de Bandeja (HU-5.1, HU-5.2)
- [ ] Crear icono de aplicación
- [ ] Implementar minimización a bandeja al cerrar (X)
- [ ] Implementar restauración con clic simple
- [ ] Crear menú contextual:
  - [ ] "Abrir Becall-Mount"
  - [ ] "Montar todos"
  - [ ] "Desmontar todos"
  - [ ] Lista de servicios con estado
  - [ ] "Cerrar"

**Tiempo estimado**: 3-4 días

#### 5.2 Acciones Masivas (CU-05)
- [ ] Implementar "Montar todos" con configuración guardada
- [ ] Implementar "Desmontar todos"
- [ ] Crear sistema de notificaciones de resultado

**Tiempo estimado**: 2 días

#### 5.3 Cierre de Aplicación (HU-5.3, CU-06)
- [ ] Implementar cierre definitivo desde menú
- [ ] Asegurar que montajes siguen activos tras cierre
- [ ] Procesos de Rclone continúan ejecutándose

**Tiempo estimado**: 1 día

**Hitos de Fase 5**:
- ✅ Integración con system tray completa
- ✅ Aplicación funciona en segundo plano
- ✅ Montajes persisten tras cierre

---

## Fase 6: Configuración y Funciones Avanzadas

### Objetivo
Implementar pantalla de configuración y funciones para usuarios avanzados.

### Tareas

#### 6.1 Pantalla de Configuración (HU-6.1, HU-6.2, HU-6.3)
- [ ] Crear modal de configuración
- [ ] Implementar selector de tema visual
- [ ] Crear UI de cambio de contraseña
- [ ] Implementar eliminación de contraseña guardada
- [ ] Mostrar versión actual de Rclone
- [ ] Implementar botón de búsqueda de actualizaciones
- [ ] Bloquear actualización si hay montajes activos

**Tiempo estimado**: 3-4 días

#### 6.2 Terminal de Configuración (HU-7.1)
- [ ] Crear botón para abrir terminal con `rclone config`
- [ ] Implementar detección de cierre de terminal
- [ ] Refrescar lista de servicios automáticamente

**Tiempo estimado**: 1 día

#### 6.3 Interfaz Web de Rclone (HU-7.2)
- [ ] Crear botón dedicado (icono de mapamundi)
- [ ] Implementar lanzamiento de `rclone rcd`
- [ ] Abrir navegador en URL correcta
- [ ] Ejecutar en background sin bloquear app

**Tiempo estimado**: 2 días

**Hitos de Fase 6**:
- ✅ Configuración completa accesible
- ✅ Funciones avanzadas operativas

---

## Fase 7: Notificaciones y Feedback

### Objetivo
Implementar sistema de notificaciones y mensajes informativos.

### Tareas

#### 7.1 Notificaciones del Sistema (HU-8.1)
- [ ] Implementar notificación de montaje completado
- [ ] Implementar notificación de error al montar
- [ ] Implementar notificación de error de conexión/pérdida de montaje
- [ ] Implementar notificación de contraseña incorrecta
- [ ] Implementar notificación de actualización de Rclone

**Tiempo estimado**: 2-3 días

#### 7.2 Mensajes en Aplicación (HU-8.2)
- [ ] Crear sistema de toast/snackbar para feedback
- [ ] Implementar mensajes de error en formularios
- [ ] Implementar confirmaciones de acciones
- [ ] Implementar avisos informativos

**Tiempo estimado**: 2 días

**Hitos de Fase 7**:
- ✅ Sistema de notificaciones completo
- ✅ Feedback visual en todas las acciones

---

## Fase 8: Testing, Optimización y Preparación para Release

### Objetivo
Asegurar calidad, rendimiento y preparación para distribución.

### Tareas

#### 8.1 Testing
- [ ] Testing manual de todos los casos de uso (CU-01 a CU-07)
- [ ] Verificar criterios de éxito
- [ ] Testing de seguridad (encriptación, credenciales)
- [ ] Testing de persistencia de estado
- [ ] Testing de montajes múltiples
- [ ] Pruebas de estrés de montajes prolongados

**Tiempo estimado**: 5-7 días

#### 8.2 Optimización
- [ ] Verificar tiempo de inicio (< 5 segundos)
- [ ] Optimizar consumo de memoria
- [ ] Optimizar tiempo de respuesta de montajes
- [ ] Revisar y optimizar logs

**Tiempo estimado**: 3-4 días

#### 8.3 Documentación
- [ ] Crear README.md con:
  - [ ] Descripción del proyecto
  - [ ] Instrucciones de instalación
  - [ ] Guía de uso básico
- [ ] Crear guías de solución de problemas
- [ ] Documentar configuración avanzada

**Tiempo estimado**: 2-3 días

#### 8.4 Empaquetado y Distribución
- [ ] Configurar Electron Forge para build
- [ ] Crear instalador para Windows
- [ ] Configurar auto-updater (opcional)
- [ ] Testing de instalador

**Tiempo estimado**: 3-4 días

**Hitos de Fase 8**:
- ✅ Aplicación probada y estable
- ✅ Documentación completa
- ✅ Instalador funcional

---

## Resumen de Tiempos

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Fundamentos Técnicos | 9-12 días |
| 2 | Seguridad y Configuración | 7-10 días |
| 3 | Interfaz y Gestión de Servicios | 14-18 días |
| 4 | Sistema de Montaje | 15-17 días |
| 5 | Bandeja del Sistema | 6-7 días |
| 6 | Configuración y Funciones Avanzadas | 6-7 días |
| 7 | Notificaciones y Feedback | 4-5 días |
| 8 | Testing y Release | 13-18 días |
| **TOTAL** | | **74-94 días** |

---

## Orden Recomendado de Implementación por Valor de Negocio

### Sprint 1 (MVP Básico) - Fases 1-2
**Objetivo**: Infraestructura técnica + Seguridad
- Proyecto configurado y ejecutable
- Rclone se descarga automáticamente
- Sistema de seguridad funcional
- Usuario puede establecer contraseña y abrir la aplicación

### Sprint 2 (Core Básico) - Fase 3 (parcial)
**Objetivo**: Ver servicios
- Interfaz principal
- Listado de servicios existentes
- Formularios para añadir B2 y S3
- Editar y eliminar servicios

### Sprint 3 (Funcionalidad Principal) - Fase 4
**Objetivo**: Montar y desmontar
- Sistema de montaje completo
- Usuario puede montar servicios como unidades
- Desmontaje funcional
- Persistencia básica

### Sprint 4 (Integración) - Fase 5
**Objetivo**: Second plano
- System tray
- Montajes persisten al cerrar
- Acciones rápidas desde bandeja

### Sprint 5 (Avanzado) - Fases 6-7
**Objetivo**: Power users
- Configuración completa
- Funciones avanzadas (terminal, web UI)
- Notificaciones

### Sprint 6 (Release) - Fase 8
**Objetivo**: Calidad y distribución
- Testing completo
- Documentación
- Instalador

---

## Dependencias Críticas

1. **Fase 1** debe completarse antes que cualquier otra (base técnica)
2. **Fase 2** depende de Fase 1 (seguridad requiere infraestructura)
3. **Fase 3** depende de Fase 2 (gestión de servicios requiere seguridad)
4. **Fase 4** depende de Fase 3 (montaje requiere servicios existentes)
5. **Fase 5** puede desarrollarse en paralelo con Fase 4 (bandeja es independiente)
6. **Fase 6** depende de Fase 3 (configuración requiere UI base)
7. **Fase 7** puede desarrollarse en paralelo con Fases 4-6
8. **Fase 8** requiere todas las anteriores completas

---

## Riesgos y Consideraciones

### Técnicos
- **Integración con Rclone**: Requiere testing exhaustivo de comandos y parámetros
- **Gestión de procesos**: Procesos huérfanos pueden causar inconsistencias
- **Encriptación**: Requiere implementación segura y sin fugas de credenciales

### de Usuario
- **Curva de aprendizaje**: Primer inicio debe ser extremadamente simple
- **Mensajes de error**: Críticos que sean claros para no técnicos
- **Expectativas**: Montajes no son instantáneos, feedback visual es clave

### de Plataforma
- **Windows 10/11**: Testing en ambas versiones necesario
- **Permisos**: Asegurar que funciona sin administrador
- **Antivirus**: Puede bloquear ejecución de Rclone o montajes

---

## Próximos Pasos Inmediatos

1. Revisar y aprobar este planning
2. Crear repositorio en GitHub (ya completado ✅)
3. Iniciar Fase 1: Configuración inicial del proyecto
4. Configurar sistema de tracking de tareas (Issues/Projects en GitHub)
5. Establecer frecuencia de sync y revisión de progreso
