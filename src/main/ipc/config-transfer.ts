import { ipcMain, dialog } from 'electron';
import fs from 'fs-extra';
import { encrypt, decrypt } from '../utils/crypto';
import { RcloneConfig } from '../rclone/config';

const config = new RcloneConfig();

export function registerConfigTransferHandlers() {
  ipcMain.handle('config:export', async (_, { serviceNames, password }) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: 'becall-mount-export.conf',
            filters: [{ name: 'Configuración Becall-Mount', extensions: ['conf'] }]
        });

        if (!filePath) return { success: false };

        const servicesToExport = [];
        for (const name of serviceNames) {
            const remote = await config.getRemoteConfig(name);
            // Need the type. listRemotes gives name/type. getRemoteConfig gives config.
            // Actually getRemoteConfig result usually has 'type' in it or we merge it?
            // Rclone 'config dump' returns object with keys as remote names.
            // getRemoteConfig returns the specific remote object which INCLUDES 'type'.
            if (remote) {
                servicesToExport.push({
                    name,
                    type: remote.type,
                    params: remote
                });
            }
        }

        const payload = JSON.stringify({
            version: 1,
            services: servicesToExport
        });

        const encrypted = await encrypt(payload, password);
        await fs.writeFile(filePath, encrypted);

        return { success: true, filePath };
    } catch (e: any) {
        console.error('Export failed', e);
        return { success: false, error: e.message };
    }
  });

  ipcMain.handle('config:import', async (_, { filePath, password }) => {
    try {
        const buffer = await fs.readFile(filePath);
        let content = '';
        
        try {
            content = await decrypt(buffer, password);
        } catch (e) {
            return { success: false, error: 'Contraseña incorrecta o archivo corrupto' };
        }

        const data = JSON.parse(content);
        if (data.version !== 1 || !Array.isArray(data.services)) {
            return { success: false, error: 'Formato de archivo inválido' };
        }

        const existingRemotes = await config.listRemotes();
        const existingNames = new Set(existingRemotes.map(r => r.name));
        
        const conflicts = [];
        let imported = 0;

        for (const service of data.services) {
            if (existingNames.has(service.name)) {
                conflicts.push({ name: service.name, type: service.type, params: service.params });
            } else {
                // Remove 'type' from params if it's there, as createRemote takes type argument
                // Actually createRemote(name, type, params). 
                // Params usually excludes name/type in the prompt logic, but rclone config create takes key=value.
                // 'type' is a separate arg.
                const { type, ...params } = service.params;
                await config.createRemote(service.name, service.type, params);
                imported++;
            }
        }

        // We return conflicts full data so UI can decide how to re-submit them (rename/overwrite)
        return { success: true, servicesImported: imported, conflicts };
    } catch (e: any) {
        console.error('Import failed', e);
        return { success: false, error: e.message };
    }
  });
}