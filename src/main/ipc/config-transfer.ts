import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { RcloneConfig } from '../rclone/config';
import { RCLONE_EXE_PATH } from '../utils/paths';
import { ADSyncService } from '../ad/sync';
import { ConfProcessor } from '../../renderer/src/lib/conf-processor';

const config = new RcloneConfig();

async function decryptContent(filePath: string, password?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(RCLONE_EXE_PATH, ['config', 'show', '--config', filePath], {
      env: { ...process.env, RCLONE_CONFIG_PASS: password }
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || 'Contraseña incorrecta'));
    });
  });
}

function parseRcloneIni(content: string): { name: string, type: string, params: Record<string, string> }[] {
  const remotes: { name: string, type: string, params: Record<string, string> }[] = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let currentRemote: any = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;
    if (line.startsWith('[') && line.endsWith(']')) {
      if (currentRemote) remotes.push(currentRemote);
      currentRemote = { name: line.slice(1, -1), params: {} };
    } else if (currentRemote && line.includes('=')) {
      const parts = line.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'type') currentRemote.type = val;
      else currentRemote.params[key] = val;
    }
  }
  if (currentRemote) remotes.push(currentRemote);
  return remotes;
}

export function registerConfigTransferHandlers() {
  ipcMain.handle('config:export', async (_, { serviceNames, password }) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: 'becall-mount-export.conf',
            filters: [{ name: 'Configuración Rclone (.conf)', extensions: ['conf'] }]
        });

        if (!filePath) return { success: false };
        await config.exportTo(filePath, serviceNames, password);
        return { success: true, filePath };
    } catch (e: any) {
        console.error('Export failed', e);
        return { success: false, error: e.message };
    }
  });

  ipcMain.handle('config:import', async (_, { filePath, password }) => {
    try {
        if (!fs.existsSync(filePath)) throw new Error('El archivo no existe');
        
        const rawBuffer = await fs.readFile(filePath);
        const preview = rawBuffer.toString('utf-8', 0, 100);
        let content = '';

        if (preview.includes('RCLONE_ENCRYPT_V0') || !preview.trim().startsWith('[')) {
            try {
                content = await decryptContent(filePath, password);
            } catch (e) {
                return { success: false, error: 'Contraseña incorrecta o archivo corrupto' };
            }
        } else {
            content = rawBuffer.toString('utf-8');
        }

        // --- NUEVA LÓGICA DE SUSTITUCIÓN DE VARIABLES AD ---
        console.log('[ConfigTransfer] Procesando variables de AD antes de importar...');
        const userInfo = await ADSyncService.getUserInfo().catch(() => null);
        const processedContent = ConfProcessor.process(content, userInfo);
        // ----------------------------------------------------

        const servicesToImport = parseRcloneIni(processedContent);
        if (servicesToImport.length === 0) {
            return { success: false, error: 'No se encontraron servicios válidos en el archivo' };
        }

        const existingRemotes = await config.listRemotes();
        const existingNames = new Set(existingRemotes.map(r => r.name));
        
        const conflicts = [];
        let importedCount = 0;

        for (const service of servicesToImport) {
            if (existingNames.has(service.name)) {
                conflicts.push({ name: service.name, type: service.type, params: service.params });
            } else {
                await config.createRemote(service.name, service.type, service.params);
                importedCount++;
            }
        }

        if (importedCount > 0) {
            BrowserWindow.getAllWindows().forEach(win => win.webContents.send('services:updated'));
        }

        return { success: true, servicesImported: importedCount, conflicts };
    } catch (e: any) {
        console.error('Import failed', e);
        return { success: false, error: e.message };
    }
  });
}