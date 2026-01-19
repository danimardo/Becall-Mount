# Formato del Archivo de Esquema de Remotos (remotes-schema.json)

## Descripción General

El archivo `src/renderer/src/config/remotes-schema.json` define la estructura de campos de configuración para cada tipo de servicio de almacenamiento soportado por la aplicación. Este archivo se empaqueta con la aplicación y **no es editable por el usuario en tiempo de ejecución**.

## Ubicación

- **Ruta**: `src/renderer/src/config/remotes-schema.json`
- **Tipo**: JSON
- **Codificación**: UTF-8
- **Empaquetado**: Se incluye en el bundle de producción

## Estructura del Archivo

```json
{
  "remotes": [
    {
      "name": "Nombre visible del servicio",
      "type": "tipo-interno",
      "icon": "URL opcional del icono",
      "mountArgs": ["--arg1", "--arg2"],
      "config": {
        "nombre_campo": {
          "label": "Etiqueta visible",
          "type": "string|number|boolean",
          "required": true|false,
          "placeholder": "texto de ayuda",
          "value": "valor por defecto",
          "hidden": true|false
        }
      }
    }
  ]
}
```

## Campos Principales

### `remotes` (Array)
Array de objetos que define cada tipo de servicio soportado.

### Objeto de Servicio

Cada elemento del array `remotes` debe contener:

#### `name` (String, **Requerido**)
- **Descripción**: Nombre visible del servicio en la interfaz de usuario
- **Ejemplo**: `"Amazon S3"`, `"Backblaze B2"`
- **Uso**: Se muestra en el selector de tipos de servicio

#### `type` (String, **Requerido**)
- **Descripción**: Identificador único interno del tipo de servicio
- **Ejemplo**: `"s3"`, `"b2"`, `"drive"`
- **Uso**: Se usa para identificar el tipo en el backend y en rclone
- **Restricción**: Debe coincidir con un tipo válido de rclone

#### `icon` (String, Opcional)
- **Descripción**: URL o ruta local del icono/gráfico representativo del servicio
- **Ejemplo URL externa**: `"https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png"`
- **Ejemplo ruta local**: `"./icons/amazon-s3.png"`
- **Uso**: Se muestra en la tarjeta del servicio en la interfaz principal
- **Comportamiento**: Si no se especifica, se usa un icono genérico de nube

#### `mountArgs` (Array de Strings, Opcional)
- **Descripción**: Parámetros adicionales específicos que se añadirán al comando `rclone mount` para este tipo de servicio.
- **Ejemplo**: `["--no-console", "--vfs-cache-mode", "full"]`
- **Uso**: Permite optimizar el montaje según el proveedor (ej. S3 requiere parámetros distintos a Google Drive).

#### `config` (Object, **Requerido**)
Objeto que contiene la configuración de campos para este servicio. Cada clave es un nombre de campo y cada valor es un objeto `RemoteFieldConfig`.

## Configuración de Campos (RemoteFieldConfig)

Cada campo dentro de `config` puede tener las siguientes propiedades:

### `label` (String, Opcional)
- **Descripción**: Etiqueta visible para el usuario en el formulario
- **Ejemplo**: `"Access Key ID"`, `"ID de Cuenta"`
- **Uso**: Texto que se muestra encima del input
- **Por defecto**: Si no se especifica, se usa el nombre del campo (`key`)

### `type` (String, Opcional)
- **Descripción**: Tipo de dato del campo
- **Valores posibles**: `"string"`, `"number"`, `"boolean"`
- **Por defecto**: `"string"`
- **Comportamiento**:
  - `string`: Input de texto o password
  - `number`: Input numérico
  - `boolean`: Select con opciones "Sí"/"No"

### `required` (Boolean, Opcional)
- **Descripción**: Indica si el campo es obligatorio
- **Por defecto**: `false`
- **Comportamiento**:
  - `true`: El campo se marca con un asterisco rojo (*) y debe estar cumplimentado para crear el servicio
  - `false`: El campo es opcional
- **Validación**: La aplicación valida los campos obligatorios al enviar el formulario

### `placeholder` (String, Opcional)
- **Descripción**: Texto de ayuda que se muestra en el campo cuando está vacío
- **Ejemplo**: `"us-east-1"`, `"Account ID"`
- **Uso**: Guía al usuario sobre qué valor introducir

### `value` (String|Boolean, Opcional)
- **Descripción**: Valor por defecto del campo
- **Ejemplo**: `"true"`, `"AWS"`
- **Comportamiento**:
  - Se usa automáticamente al crear el servicio
  - Si el usuario introduce un valor, este sobrescribe el por defecto
  - Es útil para campos ocultos o configuraciones predefinidas

### `hidden` (Boolean, Opcional)
- **Descripción**: Indica si el campo debe ocultarse en el formulario
- **Por defecto**: `false`
- **Uso**: Campos que se deben enviar a rclone pero que el usuario no necesita ver
- **Ejemplo típico**: `"type"` y `"provider"` que definen el tipo de servicio

## Ejemplos de Configuración

### Ejemplo 1: Amazon S3 con Campos Obligatorios y Opcionales

**Opción A: Con URL externa**
```json
{
  "name": "Amazon S3",
  "type": "s3",
  "icon": "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
  "config": {
```

**Opción B: Con icono local (recomendado)**
```json
{
  "name": "Amazon S3",
  "type": "s3",
  "icon": "./icons/amazon-s3.png",
  "config": {
    "type": {
      "value": "s3",
      "hidden": true
    },
    "provider": {
      "value": "AWS",
      "hidden": true
    },
    "access_key_id": {
      "label": "Access Key ID",
      "type": "string",
      "required": true,
      "placeholder": "AWS Access Key ID"
    },
    "secret_access_key": {
      "label": "Secret Access Key",
      "type": "string",
      "required": true,
      "placeholder": "AWS Secret Access Key"
    },
    "region": {
      "label": "Región",
      "type": "string",
      "required": true,
      "placeholder": "us-east-1"
    },
    "endpoint": {
      "label": "Endpoint",
      "type": "string",
      "required": true,
      "placeholder": "https://s3.amazonaws.com"
    },
    "bucket": {
      "label": "Bucket",
      "type": "string",
      "required": true,
      "placeholder": "mi-bucket-s3"
    },
    "path": {
      "label": "Ruta",
      "type": "string",
      "required": false,
      "placeholder": "ruta/dentro/del/bucket"
    }
  }
}
```

### Ejemplo 2: Backblaze B2 con Campos Opcionales

```json
{
  "name": "Backblaze B2",
  "type": "b2",
  "icon": "https://www.backblaze.com/blog/wp-content/uploads/2021/05/b2-logo-primary.png",
  "config": {
    "type": {
      "value": "b2",
      "hidden": true
    },
    "account": {
      "label": "ID de Cuenta",
      "type": "string",
      "required": true,
      "placeholder": "Account ID"
    },
    "key": {
      "label": "Clave de Aplicación",
      "type": "string",
      "required": true,
      "placeholder": "Application Key"
    },
    "hard_delete": {
      "label": "Hard Delete",
      "type": "boolean",
      "value": "true"
    },
    "bucket": {
      "label": "Bucket",
      "type": "string",
      "required": false,
      "placeholder": "mi-bucket-b2"
    },
    "path": {
      "label": "Ruta",
      "type": "string",
      "required": false,
      "placeholder": "ruta/dentro/del/bucket"
    }
  }
}
```

## Comportamiento de Campos Especiales

### Campos de Tipo Password

Los campos cuyo nombre contiene `key` o `secret` (insensible a mayúsculas) se renderizan automáticamente como campos de contraseña (`type="password"`).

**Ejemplo**:
- `access_key_id` → Password
- `secret_access_key` → Password
- `application_key` → Password

### Campos Booleanos

Los campos de tipo `boolean` se renderizan como un elemento `<select>` con dos opciones:
- `"Sí"` (valor: `"true"`)
- `"No"` (valor: `"false"`)

### Campos Ocultos

Los campos con `"hidden": true`:
- No se muestran en el formulario
- Se incluyen automáticamente en la configuración final
- Se usan típicamente para `type` y `provider`

## Cómo Añadir un Nuevo Servicio

1. **Añade el servicio al array `remotes`** en `remotes-schema.json`
2. **Define los campos necesarios** según la documentación de rclone para ese tipo
3. **Establece `required: true`** en los campos obligatorios
4. **Opcionalmente añade un `icon`** con la URL de un logo del servicio
5. **Recompila la aplicación** para incluir los cambios

No es necesario modificar el código TypeScript o Svelte. El formulario se generará automáticamente.

## Validaciones

### Validación de Campos Obligatorios

- La aplicación valida que todos los campos con `"required": true` tengan un valor antes de crear el servicio
- Si faltan campos obligatorios, se muestran errores específicos
- Los campos obligatorios se marcan visualmente con un asterisco rojo (*)

### Validación de Tipos

- `string`: Cualquier texto válido
- `number`: Debe ser un número válido
- `boolean`: Siempre tendrá valor "true" o "false"

## Consideraciones de Seguridad

⚠️ **Importante**: Este archivo se empaqueta con la aplicación y contiene definiciones de campos pero **no debe contener credenciales reales**.

- Los valores por defecto (`value`) son solo para configuraciones técnicas (como `"type": "s3"`)
- Nunca incluyas claves de API, tokens u otras credenciales sensibles en este archivo
- Los usuarios introducen sus propias credenciales a través del formulario generado

## Integración con el Código

### Tipos TypeScript

Los tipos correspondientes se definen en `src/contracts/types.ts`:

```typescript
interface RemoteFieldConfig {
  label?: string;
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
  placeholder?: string;
  value?: string | boolean;
  hidden?: boolean;
}

interface RemoteSchema {
  name: string;
  type: string;
  icon?: string;
  config: Record<string, RemoteFieldConfig>;
}

interface RemotesSchema {
  remotes: RemoteSchema[];
}
```

### Funciones del Loader

El archivo `src/renderer/src/lib/remote-schema-loader.ts` proporciona funciones para trabajar con el esquema:

- `getAvailableRemoteTypes()`: Obtiene todos los tipos de servicios
- `getRemoteConfig(type)`: Obtiene la configuración de un tipo específico
- `getVisibleFields(type)`: Obtiene solo los campos no ocultos
- `getAllFields(type)`: Obtiene todos los campos (incluyendo ocultos)
- `buildConfigWithDefaults(type, userParams)`: Construye la configuración final con valores por defecto

## Uso de Iconos Locales

### Ventajas de Usar Iconos Locales

**Rendimiento**:
- ✅ Carga instantánea (sin descarga desde internet)
- ✅ No depende de la velocidad de conexión
- ✅ Funciona sin conexión a internet

**Control**:
- ✅ Tamaño y calidad controlados
- ✅ No dependes de servicios externos
- ✅ Los iconos siempre están disponibles

### Cómo Configurar Iconos Locales

#### Paso 1: Crear la Carpeta de Iconos

La carpeta ya existe en: `public/icons/`

#### Paso 2: Añadir tus Iconos

Copia tus archivos de imagen a `public/icons/`:

```
public/icons/
├── amazon-s3.png          (64x64 o 128x128 px)
├── backblaze-b2.png       (64x64 o 128x128 px)
├── google-drive.png       (opcional)
└── cloud-icon.png         (icono genérico por defecto)
```

#### Paso 3: Referenciarlos en remotes-schema.json

```json
{
  "name": "Amazon S3",
  "type": "s3",
  "icon": "./icons/amazon-s3.png",
  "config": { ... }
}
```

### Formatos de Imagen Soportados

| Formato | Ventajas | Recomendado para |
|---------|----------|------------------|
| **PNG** | Transparencia, buena calidad | ✅ Iconos con fondo transparente |
| **SVG** | Escalable, peso ligero | ✅ Logos vectoriales (recomendado) |
| **WebP** | Buen compresión | ⚠️ Compatibilidad limitada |
| **JPG** | Compresión | ❌ No tiene transparencia |

### Recomendaciones de Diseño

**Tamaño**:
- Mínimo: 32x32 píxeles
- Recomendado: 64x64 o 128x128 píxeles
- Máximo: 256x256 píxeles

**Estilo**:
- Fondo transparente (PNG)
- Diseño simple y reconocible
- Buen contraste
- Cuadrado o ligeramente rectangular

**Dónde Conseguir Iconos**:
- Sitios web oficiales de los servicios
- Simple Icons (https://simpleicons.org/)
- Iconify (https://icon-sets.iconify.design/)
- Diseñarlos con herramientas como Figma o Inkscape

### Ejemplo Práctico

**Antes (URL externa)**:
```json
{
  "name": "Backblaze B2",
  "type": "b2",
  "icon": "https://www.backblaze.com/blog/wp-content/uploads/2021/05/b2-logo-primary.png",
  ...
}
```

**Después (icono local)**:
```json
{
  "name": "Backblaze B2",
  "type": "b2",
  "icon": "./icons/backblaze-b2.png",
  ...
}
```

### Icono Genérico por Defecto

Si un servicio no tiene campo `icon`, la aplicación usará automáticamente un icono genérico de nube. Puedes personalizar este icono genérico colocando un archivo llamado `cloud-icon.png` en `public/icons/`.

## Soporte y Mantenimiento

Si necesitas añadir soporte para un nuevo tipo de servicio o modificar campos existentes:

1. Consulta la documentación de rclone para ese tipo: https://rclone.org/
2. Identifica los campos necesarios y cuáles son obligatorios
3. Añade o modifica la entrada correspondiente en `remotes-schema.json`
4. Recompila la aplicación
5. Prueba la creación del servicio nuevo

## Historial de Cambios

### Versión Actual
- Añadido campo `icon` para iconos personalizados de servicios
- Añadido campo `bucket` para especificar bucket concreto (obligatorio para S3, opcional para B2)
- Añadido campo `path` para especificar ruta dentro del bucket (opcional para ambos)
- Implementada validación de campos obligatorios con marcado visual (*)
- Campo `endpoint` ahora es obligatorio para S3
