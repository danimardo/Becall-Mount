import type { RemoteSchema, RemotesSchema, RemoteConfig, RemoteFieldConfig } from '../../contracts/types';
import remotesSchema from '../config/remotes-schema.json';

// Cache del esquema cargado
let schemaCache: RemotesSchema | null = null;

/**
 * Carga el esquema de remotos desde el archivo JSON
 */
export function loadRemotesSchema(): RemotesSchema {
  if (!schemaCache) {
    schemaCache = remotesSchema as RemotesSchema;
  }
  return schemaCache;
}

/**
 * Obtiene la configuración para un tipo específico de remote
 */
export function getRemoteConfig(type: string): RemoteSchema | undefined {
  const schema = loadRemotesSchema();
  return schema.remotes.find(remote => remote.type === type);
}

/**
 * Obtiene todos los tipos de remotos disponibles
 */
export function getAvailableRemoteTypes(): RemoteSchema[] {
  const schema = loadRemotesSchema();
  return schema.remotes;
}

/**
 * Obtiene los campos visibles (no hidden) para un tipo de remote
 */
export function getVisibleFields(type: string): RemoteConfig {
  const remote = getRemoteConfig(type);
  if (!remote) return {};

  const visibleFields: RemoteConfig = {};
  for (const [key, fieldConfig] of Object.entries(remote.config)) {
    if (!fieldConfig.hidden) {
      visibleFields[key] = fieldConfig;
    }
  }
  return visibleFields;
}

/**
 * Obtiene todos los campos (incluyendo hidden) para un tipo de remote
 */
export function getAllFields(type: string): RemoteConfig {
  const remote = getRemoteConfig(type);
  return remote?.config || {};
}

/**
 * Construye el objeto de configuración completa con valores por defecto
 */
export function buildConfigWithDefaults(type: string, userParams: Record<string, string>): Record<string, string> {
  const allFields = getAllFields(type);
  const config: Record<string, string> = {};

  for (const [key, fieldConfig] of Object.entries(allFields)) {
    // Si el campo tiene un valor por defecto, usarlo
    if (fieldConfig.value !== undefined) {
      config[key] = String(fieldConfig.value);
    }
    // Si el usuario proporcionó un valor, usarlo (sobrescribe el default)
    else if (userParams[key] !== undefined) {
      config[key] = userParams[key];
    }
  }

  return config;
}

/**
 * Obtiene el nombre amigable de un tipo de remote
 */
export function getRemoteName(type: string): string {
  const remote = getRemoteConfig(type);
  return remote?.name || type;
}
