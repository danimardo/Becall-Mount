import { ipcMain } from 'electron';
import { MountManager } from '../rclone/mount';

export const mountManager = new MountManager();

export function registerMountHandlers() {
  ipcMain.handle('mount:start', async (_, { serviceName, driveLetter }) => {
    await mountManager.mount(serviceName, driveLetter);
    return true;
  });

  ipcMain.handle('mount:stop', async (_, driveLetter) => {
    await mountManager.unmount(driveLetter);
    return true;
  });

  ipcMain.handle('mount:list-active', () => {
    return mountManager.getMounts();
  });
}
