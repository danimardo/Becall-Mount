import { ipcMain } from 'electron';
import { MountManager } from '../rclone/mount';

const manager = new MountManager();

export function registerMountHandlers() {
  ipcMain.handle('mount:start', async (_, { serviceName, driveLetter }) => {
    await manager.mount(serviceName, driveLetter);
    return true;
  });

  ipcMain.handle('mount:stop', async (_, driveLetter) => {
    await manager.unmount(driveLetter);
    return true;
  });

  ipcMain.handle('mount:list-active', () => {
    return manager.getMounts();
  });
}
