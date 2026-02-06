import { DomainInfo } from '../../../contracts/types';

/**
 * Procesa el contenido de un archivo .conf sustituyendo variables de AD.
 */
export class ConfProcessor {
  /**
   * Sustituye todas las ocurrencias de %Variable% por su valor en infoDominio.
   * Si la variable no existe, se sustituye por una cadena vacía.
   */
  static process(content: string, info: DomainInfo | null): string {
    if (!info) {
      console.log('[ConfProcessor] No hay información de dominio disponible. Limpiando variables.');
      return content.replace(/%[a-zA-Z0-9]+%/g, '');
    }

    console.log('[ConfProcessor] Iniciando procesamiento de variables con info de dominio.');

    const processed = content.replace(/%([a-zA-Z0-9]+)%/g, (match, key) => {
      // Buscar la clave de forma insensible a mayúsculas
      const foundKey = Object.keys(info).find(k => k.toLowerCase() === key.toLowerCase());
      const value = foundKey ? (info as any)[foundKey] : undefined;
      
      if (value === undefined || value === null) {
        console.log(`[ConfProcessor] Variable %${key}% no encontrada en AD. Sustituyendo por vacío.`);
        return '';
      }

      const stringValue = Array.isArray(value) ? value.join(',') : String(value);
      console.log(`[ConfProcessor] Sustituyendo %${key}% -> ${stringValue}`);
      return stringValue;
    });

    return processed;
  }
}