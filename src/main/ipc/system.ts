import { ipcMain, shell } from 'electron';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { isRcloneInstalled, installRclone } from '../rclone/installer';
import { isWinFspInstalled, installWinFsp } from '../utils/winfsp';
import { mountManager } from './mount';

const execAsync = promisify(exec);

export function registerSystemHandlers() {
  ipcMain.handle('system:check-prereqs', async () => {
    return {
      rclone: await isRcloneInstalled(),
      winfsp: await isWinFspInstalled(),
    };
  });

  ipcMain.handle('system:get-free-drives', async () => {
    try {
        // List busy drive letters on Windows via WMIC
        const { stdout } = await execAsync('wmic logicaldisk get name');
        const busyDrives = new Set(
            stdout.split('\r\n')
                .map(line => line.trim())
                .filter(line => line.match(/^[A-Z]:$/))
                .map(line => line[0])
        );
        
        // Also add drives that our application thinks are mounted
        mountManager.getMounts().forEach(m => {
            busyDrives.add(m.driveLetter);
        });
        
        const allDrives = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
        // Return only those NOT in busyDrives and definitely not C:
        return allDrives.filter(letter => !busyDrives.has(letter) && letter !== 'C');
    } catch (e) {
        console.error('Failed to list drives', e);
        return 'ZYXWVUTSRQPONMLKJIHGFEDBA'.split(''); 
    }
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
}
