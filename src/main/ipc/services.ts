import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import { RcloneConfig } from '../rclone/config';
import store from '../store';

const config = new RcloneConfig();

export function registerServiceHandlers() {
  ipcMain.handle('services:list', async () => {
    return await config.listRemotes();
  });

  ipcMain.handle('services:create', async (_, { name, type, params }) => {
    await config.createRemote(name, type, params);
    return true;
  });

  ipcMain.handle('mount-options:get', (_, serviceName) => {
    return store.get(`serviceMountOptions.${serviceName}`) || {};
  });

  ipcMain.handle('mount-options:set', (_, { serviceName, options }) => {
    console.log(`[IPC] Received mount options for ${serviceName}:`, options);
    try {
        store.set(`serviceMountOptions.${serviceName}`, options);
        console.log(`[IPC] Mount options saved successfully`);
        return true;
    } catch (e) {
        console.error(`[IPC] Error saving mount options:`, e);
        throw e;
    }
  });

  ipcMain.handle('services:test-connection', async (_, { type, params }) => {
    await config.testConnection(type, params);
    return true;
  });

  ipcMain.handle('services:get', async (_, name) => {
    return await config.getRemoteConfig(name);
  });

  ipcMain.handle('services:update', async (_, { name, params }) => {
    // rclone doesn't have a direct "update" that merges, 
    // but we can just use createRemote with the same name to overwrite
    // or better, get the type first.
    const remote = await config.getRemoteConfig(name);
    if (!remote) throw new Error('Service not found');
    await config.createRemote(name, remote.type, params);
    return true;
  });

  ipcMain.handle('services:delete', async (_, name) => {
    await config.deleteRemote(name);
    return true;
  });

  ipcMain.handle('services:open-terminal', () => {
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe'], { detached: true, stdio: 'ignore' });
    return true;
  });
}
