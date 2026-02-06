import { ipcMain } from 'electron';
import { ADSyncService } from '../ad/sync';
import { ConfProcessor } from '../../renderer/src/lib/conf-processor';
import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';
import { RCLONE_CONFIG_PATH } from '../utils/paths';

export function registerADHandlers() {
  // Sincronizar info de AD
  ipcMain.handle('ad:syncInfo', async () => {
    return await ADSyncService.getUserInfo();
  });

  // Importar configuraciones .conf
  ipcMain.handle('ad:importConfigs', async (event, customPath?: string) => {
    const internalPath = path.join(app.getAppPath(), 'resources', 'configs');
    const pathsToScan = [internalPath];
    
    if (customPath && fs.existsSync(customPath)) {
      pathsToScan.push(customPath);
    }

    let importedCount = 0;
    const conflicts: string[] = [];
    const userInfo = await ADSyncService.getUserInfo().catch(() => null);

    for (const scanDir of pathsToScan) {
      if (!fs.existsSync(scanDir)) continue;

      const files = fs.readdirSync(scanDir).filter(f => f.endsWith('.conf'));
      
      for (const file of files) {
        try {
          const filePath = path.join(scanDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Procesar variables
          const processedContent = ConfProcessor.process(content, userInfo);
          
          // Por simplicidad en este MVP, añadimos al final de rclone.conf
          // En una implementación real, deberíamos parsear los bloques para evitar duplicados
          // o usar la CLI de rclone para importar.
          fs.appendFileSync(RCLONE_CONFIG_PATH, '\n' + processedContent);
          importedCount++;
        } catch (e) {
          console.error(`Error importing ${file}:`, e);
        }
      }
    }

    return { imported: importedCount, conflicts };
  });
}
