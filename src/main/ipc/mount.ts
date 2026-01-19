import { ipcMain } from 'electron';
import { MountManager } from '../rclone/mount';

export const mountManager = new MountManager();

export function registerMountHandlers() {
  ipcMain.handle('mount:start', async (_, { serviceName, mountType, target, extraArgs }) => {
    await mountManager.mount(serviceName, mountType, target, extraArgs || []);
    return true;
  });

  ipcMain.handle('mount:stop', async (_, target) => {
    await mountManager.unmount(target);
    return true;
  });

  ipcMain.handle('mount:stop-all', async () => {
    return await mountManager.unmountAll();
  });

  ipcMain.handle('mount:list-active', () => {
    return mountManager.getMounts();
  });
}
