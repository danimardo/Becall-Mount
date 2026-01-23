import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import { RcloneConfig } from '../rclone/config';
import getStore from '../store';

let configInstance: RcloneConfig;
function getConfig() {
  if (!configInstance) configInstance = new RcloneConfig();
  return configInstance;
}

export function registerServiceHandlers() {
  ipcMain.handle('services:list', async () => {
    return await getConfig().listRemotes();
  });

  ipcMain.handle('services:create', async (_, { name, type, params }) => {
    await getConfig().createRemote(name, type, params);
    return true;
  });

  ipcMain.handle('mount-options:get', (_, serviceName) => {
    return getStore().get(`serviceMountOptions.${serviceName}`) || {};
  });

  ipcMain.handle('mount-options:set', (_, { serviceName, options }) => {
    console.log(`[IPC] Received mount options for ${serviceName}:`, options);
    try {
        getStore().set(`serviceMountOptions.${serviceName}`, options);
        console.log(`[IPC] Mount options saved successfully`);
        return true;
    } catch (e) {
        console.error(`[IPC] Error saving mount options:`, e);
        throw e;
    }
  });

  ipcMain.handle('services:test-connection', async (_, { type, params }) => {
    await getConfig().testConnection(type, params);
    return true;
  });

  ipcMain.handle('services:get', async (_, name) => {
    return await getConfig().getRemoteConfig(name);
  });

  ipcMain.handle('services:update', async (_, { name, params }) => {
    // rclone doesn't have a direct "update" that merges, 
    // but we can just use createRemote with the same name to overwrite
    // or better, get the type first.
    const config = getConfig();
    const remote = await config.getRemoteConfig(name);
    if (!remote) throw new Error('Service not found');
    await config.createRemote(name, remote.type, params);
    return true;
  });

  ipcMain.handle('services:delete', async (_, name) => {
    await getConfig().deleteRemote(name);
    return true;
  });

  ipcMain.handle('services:open-terminal', () => {
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe'], { detached: true, stdio: 'ignore' });
    return true;
  });
}
