import { ipcMain, BrowserWindow } from 'electron';
import { ADSyncService } from '../ad/sync';
import { ConfProcessor } from '../../renderer/src/lib/conf-processor';
import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';
import { RCLONE_CONFIG_PATH, RCLONE_EXE_PATH } from '../utils/paths';
import { getSessionPassword } from '../utils/session';
import { spawn } from 'child_process';
import { RcloneConfig } from '../rclone/config';

async function tryDecrypt(filePath: string, password: string): Promise<string> {
  console.log(`[AD-IMPORT-DEBUG] 🔐 Ejecutando: rclone config show --config "${filePath}"`);
  return new Promise((resolve, reject) => {
    // Usamos la misma técnica que en tu terminal
    const child = spawn(RCLONE_EXE_PATH, ['config', 'show', '--config', filePath], {
      env: { 
        ...process.env, 
        RCLONE_CONFIG_PASS: password,
        // Forzamos a rclone a no buscar otros archivos de configuración
        RCLONE_CONFIG: filePath 
      }
    });
    
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        console.error(`[AD-IMPORT-DEBUG] ❌ Error de Rclone (Código ${code}):`, stderr.trim());
        reject(new Error(stderr.trim()));
      }
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
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key === 'type') currentRemote.type = val;
        else currentRemote.params[key] = val;
      }
    }
  }
  if (currentRemote) remotes.push(currentRemote);
  return remotes;
}

export function registerADHandlers() {
  ipcMain.handle('ad:syncInfo', async () => {
    return await ADSyncService.getUserInfo();
  });

  ipcMain.handle('ad:importConfigs', async (event, { passwords }: { passwords?: Record<string, string> }) => {
    console.log('--- INICIO IMPORTACIÓN AD (SOLO INTERNA) ---');
    
    const internalPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'configs')
      : path.join(app.getAppPath(), 'public', 'configs');
      
    const pathsToScan = [internalPath];
    
    let totalImported = 0;
    const userInfo = await ADSyncService.getUserInfo().catch(() => null);
    const rcloneConfig = new RcloneConfig();
    const results = { imported: 0, failed: [] as string[], needPassword: [] as {path: string, name: string}[] };

    for (const scanDir of pathsToScan) {
      if (!fs.existsSync(scanDir)) continue;
      const files = fs.readdirSync(scanDir).filter(f => f.toLowerCase().endsWith('.conf'));
      
      for (const file of files) {
        const filePath = path.join(scanDir, file);
        try {
          const buffer = fs.readFileSync(filePath);
          const preview = buffer.toString('utf-8', 0, 100);
          
          // Detección: si no empieza por "[" es que está cifrado o no es un INI válido
          const isEncrypted = !preview.trim().startsWith('[') || preview.includes('RCLONE_ENCRYPT_V0');
          
          let content = '';
          if (isEncrypted) {
            const pass = passwords?.[filePath];
            if (!pass) {
              results.needPassword.push({ path: filePath, name: file });
              continue;
            }

            try {
              content = await tryDecrypt(filePath, pass);
            } catch (e: any) {
              results.needPassword.push({ path: filePath, name: file });
              continue;
            }
          } else {
            content = buffer.toString('utf-8');
          }
          
          const processedContent = ConfProcessor.process(content, userInfo);
          const remotesToImport = parseRcloneIni(processedContent);
          
          for (const remote of remotesToImport) {
            if (remote.name && remote.type) {
              console.log(`[AD-IMPORT-DEBUG] -> Importando remoto: ${remote.name}`);
              await rcloneConfig.createRemote(remote.name, remote.type, remote.params);
              totalImported++;
            }
          }
        } catch (e: any) {
          console.error(`[AD-IMPORT-DEBUG] Error en ${file}:`, e.message);
          results.failed.push(`${file}: ${e.message}`);
        }
      }
    }

    if (totalImported > 0) {
      BrowserWindow.getAllWindows().forEach(win => win.webContents.send('services:updated'));
    }
    
    results.imported = totalImported;
    return results;
  });
}
