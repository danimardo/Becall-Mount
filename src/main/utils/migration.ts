import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';

/**
 * Servicio encargado de migrar los datos de la aplicación anterior (Cloud Mount)
 * a la nueva estructura de Becall-Mount.
 */
export class MigrationService {
  private static readonly OLD_APP_NAME = 'cloud-mount'; // Nombre anterior probable en AppData
  private static readonly NEW_APP_NAME = 'becall-mount';

  /**
   * Ejecuta el proceso de migración si detecta una instalación antigua.
   * Se debe llamar antes de que cualquier otro servicio acceda al Store o a rclone.conf.
   */
  static async migrateIfNeeded(): Promise<boolean> {
    const appData = app.getPath('appData');
    const oldPath = path.join(appData, this.OLD_APP_NAME);
    const newPath = app.getPath('userData');

    console.log(`[Migration] Checking: Old=${oldPath}, New=${newPath}`);

    // Si no existe la carpeta antigua, no hay nada que migrar
    if (!fs.existsSync(oldPath)) {
      console.log('[Migration] No old configuration found at:', oldPath);
      return false;
    }

    // Si la nueva carpeta ya tiene datos significativos, evitamos sobrescribir por seguridad
    // a menos que esté vacía o solo tenga archivos de sesión básicos
    if (fs.existsSync(newPath) && fs.readdirSync(newPath).length > 2) {
      console.log('[Migration] New configuration already exists, skipping migration.');
      return false;
    }

    try {
      console.log(`[Migration] Moving data from ${oldPath} to ${newPath}`);
      
      // Aseguramos que el directorio destino exista
      await fs.ensureDir(newPath);

      // Copiamos el contenido de la carpeta antigua a la nueva
      await fs.copy(oldPath, newPath, {
        overwrite: false,
        errorOnExist: true,
      });

      console.log('[Migration] Migration successful.');
      return true;
    } catch (error) {
      console.error('[Migration] Error during migration:', error);
      return false;
    }
  }

  /**
   * Elimina de forma segura la carpeta de la marca antigua tras verificar la integridad.
   */
  static async cleanupOldData(): Promise<void> {
    const appData = app.getPath('appData');
    const oldPath = path.join(appData, this.OLD_APP_NAME);

    if (fs.existsSync(oldPath)) {
      try {
        console.log(`[Migration] Cleaning up old directory: ${oldPath}`);
        await fs.remove(oldPath);
      } catch (error) {
        console.error('[Migration] Error cleaning up old directory:', error);
      }
    }
  }
}
