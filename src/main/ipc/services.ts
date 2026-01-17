import { ipcMain } from 'electron';
import { RcloneConfig } from '../rclone/config';

const config = new RcloneConfig();

export function registerServiceHandlers() {
  ipcMain.handle('services:list', async () => {
    return await config.listRemotes();
  });

  ipcMain.handle('services:create', async (_, { name, type, params }) => {
    await config.createRemote(name, type, params);
    return true;
  });

  ipcMain.handle('services:delete', async (_, name) => {
    await config.deleteRemote(name);
    return true;
  });
}
