import { ipcMain } from 'electron';
import { MountManager } from '../rclone/mount';

export const mountManager = new MountManager();

export function registerMountHandlers() {
  ipcMain.handle('mount:start', async (_, { serviceName, mountType, target, force }) => {
    // Legacy support: if only driveLetter provided, map to target
    // But for new UI we use mountType/target
    if (!mountType && arguments[1].driveLetter) {
        // Fallback for old calls if any
        await mountManager.mount(serviceName, 'drive', arguments[1].driveLetter);
    } else {
        await mountManager.mount(serviceName, mountType, target, force);
    }
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
