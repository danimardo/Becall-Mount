import { ipcMain } from 'electron';
import store from '../store';
import { AppSettings } from '../../contracts/types';

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:set', (_, settings: Partial<AppSettings>) => {
    store.set('settings', { ...store.get('settings'), ...settings });
    return true;
  });
}
