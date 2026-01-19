import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Establece el icono y la etiqueta personalizada para una unidad de disco en el Explorador de Windows.
 * Utiliza el registro de usuario (HKCU) para evitar requerir privilegios de administrador.
 */
export async function setDriveIconAndLabel(driveLetter: string, iconPath: string, label: string): Promise<void> {
    const letter = driveLetter.replace(':', '').toUpperCase();
    const baseKey = `HKCU\\Software\\Classes\\Applications\\explorer.exe\\Drives\\${letter}`;
    
    try {
        console.log(`[Registry] Setting icon and label for drive ${letter}: ${iconPath}`);
        // /ve establece el valor predeterminado (default)
        // /f fuerza la sobrescritura sin preguntar
        await execAsync(`reg add "${baseKey}\\DefaultIcon" /ve /d "${iconPath}" /f`);
        await execAsync(`reg add "${baseKey}\\DefaultLabel" /ve /d "${label}" /f`);
    } catch (e) {
        console.error(`[Registry] Failed to set registry keys for drive ${letter}:`, e);
    }
}

/**
 * Elimina las personalizaciones de registro para una unidad de disco.
 */
export async function clearDriveIconAndLabel(driveLetter: string): Promise<void> {
    const letter = driveLetter.replace(':', '').toUpperCase();
    const baseKey = `HKCU\\Software\\Classes\\Applications\\explorer.exe\\Drives\\${letter}`;
    
    try {
        console.log(`[Registry] Clearing registry keys for drive ${letter}`);
        await execAsync(`reg delete "${baseKey}" /f`);
    } catch (e) {
        // Ignorar error si la clave ya no existe
    }
}
