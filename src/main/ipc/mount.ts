import { ipcMain } from 'electron';
import { MountManager } from '../rclone/mount';

let mountManagerInstance: MountManager;

export function getMountManager() {
  if (!mountManagerInstance) {
    mountManagerInstance = new MountManager();
  }
  return mountManagerInstance;
}

export function registerMountHandlers() {
  const mountManager = getMountManager();

  ipcMain.handle('mount:start', async (_, { serviceName, mountType, target, extraArgs, iconPath }) => {
    await mountManager.mount(serviceName, mountType, target, extraArgs || [], iconPath);
    return true;
  });

  ipcMain.handle('mount:stop', async (_, target) => {
    await mountManager.unmount(target);
    return true;
  });

  ipcMain.handle('mount:stop-all', async () => {
    return await mountManager.unmountAll();
  });

  ipcMain.handle('mount:auto-mount-all', async () => {
    await mountManager.autoMountAll();
    return true;
  });

  ipcMain.handle('mount:list-active', () => {
    return mountManager.getMounts();
  });
}
