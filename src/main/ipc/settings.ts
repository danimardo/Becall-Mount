import { ipcMain, app } from 'electron';
import getStore from '../store';
import { AppSettings } from '../../contracts/types';

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', () => {
    return getStore().get('settings');
  });

  ipcMain.handle('settings:set', (_, settings: Partial<AppSettings>) => {
    const store = getStore();
    const currentSettings = store.get('settings');
    
    if (settings.autoLaunch !== undefined && settings.autoLaunch !== currentSettings.autoLaunch) {
        console.log(`[Settings] Changing autoLaunch to: ${settings.autoLaunch}`);
        app.setLoginItemSettings({
            openAtLogin: settings.autoLaunch,
            path: app.getPath('exe')
        });
    }

    store.set('settings', { ...currentSettings, ...settings });
    return true;
  });
}
