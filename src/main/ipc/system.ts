import { ipcMain, shell, dialog, BrowserWindow, app } from 'electron';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'fs-extra';
import { isRcloneInstalled, installRclone, checkAndAutoUpdateRclone } from '../rclone/installer';
import { isWinFspInstalled, installWinFsp } from '../utils/winfsp';
import { getMountManager } from './mount';
import { PowerShellWrapper } from '../ad/powershell';
import { getFreeDiskSpaceGB } from '../utils/system';

const execAsync = promisify(exec);

export function registerSystemHandlers() {
  ipcMain.handle('system:get-free-space', async (_, drive = 'C') => {
    return await getFreeDiskSpaceGB(drive);
  });

  ipcMain.handle('system:check-prereqs', async () => {
    await checkAndAutoUpdateRclone((msg) => {
        BrowserWindow.getAllWindows().forEach(w => w.webContents.send('splash:status', msg));
    });

    const domainCmd = '(Get-CimInstance Win32_ComputerSystem).PartOfDomain';
    const isDomainRaw = await PowerShellWrapper.execute(domainCmd).catch(() => 'False');
    const isDomain = isDomainRaw.trim().toLowerCase() === 'true';
    
    // Ya no requerimos el módulo AD de RSAT, usamos DirectorySearcher que es nativo de .NET
    // Si está en un dominio, la funcionalidad de AD está disponible.
    const hasADModule = isDomain;

    console.log(`[System] Prereqs check: Domain=${isDomain} (${isDomainRaw}), ADAvailable=${hasADModule}`);

    return {
      rclone: await isRcloneInstalled(),
      winfsp: await isWinFspInstalled(),
      isDomain,
      hasADModule
    };
  });

  ipcMain.handle('system:import-key-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Key File', extensions: ['json'] }],
        title: 'Seleccionar Archivo de Credenciales'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        const sourcePath = result.filePaths[0];
        try {
            const content = await fs.readFile(sourcePath, 'utf-8');
            // Parsear y volver a convertir a string (esto elimina saltos de línea y espacios)
            const minimized = JSON.stringify(JSON.parse(content));
            return minimized;
        } catch (e) {
            throw new Error('El archivo seleccionado no es un JSON válido.');
        }
    }
    return null;
  });

  ipcMain.handle('system:get-free-drives', async () => {
    try {
        const { stdout } = await execAsync('wmic logicaldisk get name');
        const busyDrives = new Set(
            stdout.split('\r\n')
                .map(line => line.trim())
                .filter(line => line.match(/^[A-Z]:$/))
                .map(line => line[0])
        );
        
        getMountManager().getMounts().forEach(m => {
            if (m.driveLetter) busyDrives.add(m.driveLetter);
        });
        
        const allDrives = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
        return allDrives.filter(letter => !busyDrives.has(letter) && letter !== 'C');
    } catch (e) {
        console.error('Failed to list drives', e);
        return 'ZYXWVUTSRQPONMLKJIHGFEDBA'.split(''); 
    }
  });

  ipcMain.handle('system:select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Seleccionar carpeta de montaje'
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('system:select-file', async (_, filters) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || [],
        title: 'Seleccionar archivo'
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('system:install-rclone', async (event) => {
    await installRclone((percent) => {
        event.sender.send('system:install-rclone-progress', percent);
    });
    return true;
  });

  ipcMain.handle('system:install-winfsp', async () => {
    await installWinFsp();
    return true;
  });

  ipcMain.handle('system:open-external', async (_, url) => {
    await shell.openExternal(url);
    return true;
  });

  ipcMain.handle('system:open-path', async (_, path) => {
    const error = await shell.openPath(path);
    if (error) {
        throw new Error(error);
    }
    return true;
  });

  ipcMain.handle('system:get-resource-path', (_, fileName) => {
    const prodPath = path.join(process.resourcesPath, fileName);
    if (fs.existsSync(prodPath)) {
        return `file://${prodPath}`;
    }
    // En desarrollo, Vite sirve desde la raíz /public
    return null; 
  });

  ipcMain.handle('system:restart', () => {
    app.relaunch();
    app.exit();
  });
}
