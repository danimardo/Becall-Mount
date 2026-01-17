import { ipcMain, shell } from 'electron';
import { isRcloneInstalled, installRclone } from '../rclone/installer';
import { isWinFspInstalled, installWinFsp } from '../utils/winfsp';

export function registerSystemHandlers() {
  ipcMain.handle('system:check-prereqs', async () => {
    return {
      rclone: await isRcloneInstalled(),
      winfsp: await isWinFspInstalled(),
    };
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
