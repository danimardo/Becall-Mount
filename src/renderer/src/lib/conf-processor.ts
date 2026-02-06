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
      // Si no hay info de AD, eliminamos todas las variables %...% por seguridad/limpieza
      return content.replace(/%[a-zA-Z0-9]+%/g, '');
    }

    return content.replace(/%([a-zA-Z0-9]+)%/g, (match, key) => {
      const value = (info as any)[key];
      
      if (value === undefined || value === null) {
        return '';
      }

      // Si es un array (como MemberOf), lo unimos por comas o tomamos el primero
      // Por ahora, asumimos que se buscan strings simples
      if (Array.isArray(value)) {
        return value.join(',');
      }

      return String(value);
    });
  }
}
